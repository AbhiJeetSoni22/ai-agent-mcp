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
let messages = [];
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
      const now = new Date();

      const todayReadable = now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      });

      const todayISO = now.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }); // YYYY-MM-DD

      const systemPrompt = `You are a professional assistant connected to real external tools.

            CONTEXT:
            - Current Date (IST): ${todayReadable}
            - ISO Date: ${todayISO}
            - Timezone: Asia/Kolkata (UTC+5:30)

            DATE & TIME LOGIC:
            - Interpret relative words like today, tomorrow, yesterday, next week using the current date above.
            - Convert all dates to ISO format.
            - Convert times like "5 PM" into 24-hour format (17:00:00).
            - Always generate valid ISO 8601 datetime strings when time is involved.
            - When creating times, always include timezone offset (+05:30).
                Do not use Z or UTC.

            TOOLS USAGE:
            - Use available tools whenever real-world actions or data retrieval are needed.
            - Do NOT manually guess or fabricate results.
            - Call tools using proper function calling format only.
            - After a tool responds, summarize the result clearly for the user.

            IMPORTANT:
            - Only call tools using the provided tool calling system.
            - Never output <function> or XML-like tags.

            BEHAVIOR:
            - Be concise and helpful.
            - Do not say you lack access or mention being an AI.`;

      // 2. Build the initial history
      if (messages.length === 0) {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: message,
      });

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
            arguments: call.function.arguments
              ? JSON.parse(call.function.arguments)
              : {},
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
          tools: groqTools, // ⭐ ADD THIS
          tool_choice: "none", // ⭐ prevent second tool call
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
messages = messages.slice(-5);
chat();
