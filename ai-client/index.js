import "dotenv/config";
import readline from "readline";

import Groq from "groq-sdk";
import { zodToJsonSchema } from "zod-to-json-schema";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
  =============================
  Setup Groq
  =============================
*/

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/*
  =============================
  Setup MCP Client
  =============================
*/
const serverPath = path.resolve(__dirname, "../mcp-server/mcpServer.js");

const transport = new StdioClientTransport({
  command: "node",
  args: [serverPath],
});
const mcpClient = new Client({
  name: "calendar-ai-client",
  version: "1.0.0",
});

await mcpClient.connect(transport);

/*
  Fetch available tools from server
*/
const { tools } = await mcpClient.listTools();

console.log("DEBUG tools list:", tools);

console.log("✅ Connected to MCP server\n");

/*
  =============================
  Terminal chat loop
  =============================
*/

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
async function chat() {
  rl.question("\nYou: ", async (message) => {
    try {
      // 1. Fetch fresh tools
      const { tools } = await mcpClient.listTools();
      const groqTools = tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.inputSchema,
        },
      }));

      // 2. Build the initial history
      let messages = [
        {
          role: "system",
          content: `You are a professional Google Calendar Assistant.
    
    CONTEXT:
    - Today's Date: Thursday, February 5, 2026.
    - Timezone: Indian Standard Time (IST) / UTC+5:30.
    
    TOOLS RULES:
    1. For 'getEvents', always use YYYY-MM-DD format.
    2. For 'createEvent', always use ISO 8601 strings (e.g., 2026-02-05T17:00:00).
    3. If the user says "5 PM", convert it to "17:00:00".
    4. You have ACTUAL access to the calendar. If a tool returns data, summarize it. 
    5. Never say "I don't have access" or "I am an AI".`,
        },
        { role: "user", content: message },
      ];

      // 3. First LLM Call
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        tools: groqTools,
        tool_choice: "auto",
      });

      let assistantMsg = response.choices[0].message;
      messages.push(assistantMsg);

      // 4. Check if LLM wants to use a tool
      if (assistantMsg.tool_calls) {
        for (const call of assistantMsg.tool_calls) {
          console.log(`\n[System] Executing: ${call.function.name}...`);

          const result = await mcpClient.callTool({
            name: call.function.name,
            arguments: JSON.parse(call.function.arguments),
          });

          console.log(`[System] Tool Result Received.`);

          // 5. Feed the result back to the messages array
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content:
              result.content[0].text || "Tool executed with no return text",
          });
        }

        // 6. SECOND LLM Call (The "Summary" call)
        const finalResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: messages,
        });

        console.log("\nAssistant:", finalResponse.choices[0].message.content);
      } else {
        // No tool called, just print the response
        console.log("\nAssistant:", assistantMsg.content);
      }
    } catch (err) {
      console.error("\n[Error]:", err.message);
    }
    chat();
  });
}
chat();
