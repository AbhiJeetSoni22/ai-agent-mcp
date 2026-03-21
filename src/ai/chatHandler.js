import { groq } from "../config/groqClient.js";
import { mcpClient } from "../config/mcpClient.js";

import { buildSystemPrompt, finalResponseContent } from "./prompts.js";

import { selectRelevantTools } from "./services/ToolSelection.js";
import { executeToolCalls } from "./toolExecutor.js";

const conversations = new Map();

export async function handleChat(message, sessionId) {
  const { tools } = await mcpClient.listTools();
  console.log("message ", message);

 let selectedToolNames = [];

try {
  const result = await selectRelevantTools(message, tools);
  selectedToolNames = Array.isArray(result) ? result : [];
} catch (err) {
  console.log("Tool selection error:", err.message);
  selectedToolNames = [];
}

  let filtered = tools.filter((t) =>
  selectedToolNames.includes(t.name)
);

// 🔥 fallback
if (filtered.length === 0) {
  console.log("No tools selected, fallback to all tools");
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

  let history = conversations.get(sessionId) || [];

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...history,
    { role: "user", content: message },
  ];

  const first = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    tools: groqTools,
    temperature: 0,
  });

  const assistantMsg = first.choices[0].message;

  if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: assistantMsg.content });

    conversations.set(sessionId, history.slice(-10));

    return {
      reply: assistantMsg.content,
      toolsUsed: [],
    };
  }

  messages.push(assistantMsg);

  // 👇 Capture tool names
  const toolsUsed = assistantMsg.tool_calls.map((t) => t.function.name);

  const toolMsgs = await executeToolCalls(mcpClient, assistantMsg.tool_calls);

  messages.push(...toolMsgs);

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

  history.push({ role: "user", content: message });
  history.push({ role: "assistant", content: reply });

  history = history.slice(-10);

  conversations.set(sessionId, history);
  console.log("reply ", reply);
  return {
    reply,
    toolsUsed,
  }; // ⭐ return only string
}
