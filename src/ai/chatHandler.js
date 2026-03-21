import { groq } from "../config/groqClient.js";
import { mcpClient } from "../config/mcpClient.js";

import { buildSystemPrompt} from "./prompts.js";
import { classifyIntent } from "./services/classifyIntent.js";
import { selectRelevantTools } from "./services/releventToolSelection.js";
import { executeToolCalls } from "./toolExecutor.js";

const conversations = new Map();

export async function handleChat(message, sessionId) {
  const { tools } = await mcpClient.listTools();
  console.log('message ',message)
  const intent = await classifyIntent(message);
  console.log('intent based on ',intent)
  
  const selectedToolNames = await selectRelevantTools(message, tools);

const filtered = tools.filter((t) =>
  selectedToolNames.includes(t.name)
);

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

  if (!assistantMsg.tool_calls) {
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
const toolsUsed = assistantMsg.tool_calls.map(
  (t) => t.function.name
);


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
 console.log('reply ',reply)
 return {
  reply,
  toolsUsed,
};// ⭐ return only string
}
