import { groq } from "../config/groqClient.js";
import { mcpClient } from "../config/mcpClient.js";
import { redis } from "../config/redisClient.js";
import { selectRelevantTools } from "../config/ToolSelection.js";
import { saveGithubToken } from "../services/userService.js";
import { buildSystemPrompt, finalResponseContent } from "./prompts.js";

import { executeToolCalls } from "./toolExecutor.js";

/* ================= REDIS MEMORY ================= */

const getHistory = async (sessionId) => {
  try {
    const data = await redis.get(sessionId);

    if (!data) return [];

    // 🧠 Case 1: Already parsed object (Upstash sometimes)
    if (typeof data === "object") {
      return data;
    }

    // 🧠 Case 2: String JSON
    if (typeof data === "string") {
      return JSON.parse(data);
    }

    return [];
  } catch (err) {
    console.log("Redis parse error:", err.message);
    return [];
  }
};

const saveHistory = async (sessionId, history) => {
  try {
    if (!Array.isArray(history)) return;

    await redis.set(sessionId, JSON.stringify(history.slice(-10)), {
      ex: 3600,
    });
  } catch (err) {
    console.log("Redis save error:", err.message);
  }
};

/* ================= MAIN HANDLER ================= */

export async function handleChat(message, sessionId, userId) {
    // 🔥 STEP 0: Detect GitHub token in message
  const match = message.match(/ghp_[A-Za-z0-9]+/);

  if (match) {
    const token = match[0];

    await saveGithubToken(userId, token);

    return {
      reply: "✅ GitHub connected successfully!",
      toolsUsed: [],
    };
  }
  const { tools } = await mcpClient.listTools();


  /* ===== Tool Selection ===== */
  let selectedToolNames = [];

  try {
    const result = await selectRelevantTools(message, tools);
    selectedToolNames = Array.isArray(result) ? result : [];
    
  } catch (err) {
    console.log("Tool selection error:", err.message);
  }

  let filtered = tools.filter((t) => selectedToolNames.includes(t.name));

  if (filtered.length === 0) {
    console.log("No tools selected → fallback to all tools");
    filtered = tools;
  }

  const groqTools = filtered.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }));



  /* ===== REDIS HISTORY ===== */
  let history = await getHistory(sessionId);

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...history,
    { role: "user", content: message },
  ];

  /* ===== FIRST LLM CALL ===== */
  const first = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    tools: groqTools,
    temperature: 0,
  });

  const assistantMsg = first.choices[0].message;

  /* ===== NO TOOL CASE ===== */
  if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: assistantMsg.content });

    await saveHistory(sessionId, history);

    return {
      reply: assistantMsg.content,
      toolsUsed: [],
    };
  }

  /* ===== TOOL EXECUTION ===== */
  messages.push(assistantMsg);

  const toolsUsed = assistantMsg.tool_calls.map((t) => t.function.name);
 
 const toolMsgs = await executeToolCalls({
  mcpClient,
  toolCalls: assistantMsg.tool_calls,
  userId,
});

  messages.push(...toolMsgs);

  /* ===== FINAL LLM RESPONSE ===== */
  const finalResponse = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: finalResponseContent,
      },
      ...messages,
    ],
    temperature: 0.7,
  });

  const reply = finalResponse.choices[0].message.content;
 
  /* ===== SAVE HISTORY ===== */
  history.push({ role: "user", content: message });
  history.push({ role: "assistant", content: reply });

  await saveHistory(sessionId, history);



  return {
    reply,
    toolsUsed,
  };
}
