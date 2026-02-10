import { groq } from "../config/groqClient.js";
import { mcpClient } from "../config/mcpClient.js";
import { filterTools } from "./toolFilter.js";
import { buildSystemPrompt } from "./prompts.js";
import { executeToolCalls } from "./toolExecutor.js";

const conversations = new Map(); // ⭐ GLOBAL MEMORY

export async function handleChat(message, sessionId) {
  const { tools } = await mcpClient.listTools();

  const filtered = filterTools(tools, message);
  
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

  if (!assistantMsg.tool_calls) return assistantMsg.content;

  messages.push(assistantMsg);

  const toolMsgs = await executeToolCalls(mcpClient, assistantMsg.tool_calls);

  messages.push(...toolMsgs);

  const finalResponse = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0,
  });

  const reply = finalResponse.choices[0].message.content;

  history.push({ role: "user", content: message });
  history.push({ role: "assistant", content: reply });

  history = history.slice(-10);

  conversations.set(sessionId, history);

  return reply;   // ⭐ return only string
}
