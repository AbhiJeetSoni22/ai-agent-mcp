import { groq } from "../config/groqClient.js";
import { mcpClient } from "../config/mcpClient.js";
import { buildSystemPrompt, classifyIntent } from "./prompts.js";
import { executeToolCalls } from "./toolExecutor.js";

const conversations = new Map();

export async function handleChat(message, sessionId) {
  const { tools } = await mcpClient.listTools();
  const intent = await classifyIntent(message);
  console.log('intent based on ',intent)
  let filtered = [];

  if (intent === "gmail")
    filtered = tools.filter((t) => t.name.includes("email"));
  else if (intent === "calendar")
    filtered = tools.filter((t) => t.name.toLowerCase().includes("event"));
  else if (intent === "github")
    filtered = tools.filter(
      (t) => t.name.includes("repo") || t.name.includes("issue"),
    );
  else if (intent === "web_search")
    filtered = tools.filter((t) => t.name === "web_search");
  else filtered = [];

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

  return reply; // ⭐ return only string
}
