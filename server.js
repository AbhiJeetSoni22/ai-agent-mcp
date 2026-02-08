import "dotenv/config";
import express from "express";
import cors from "cors";

import Groq from "groq-sdk";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import path from "path";
import { fileURLToPath } from "url";

/* =============================
   Path Setup
============================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =============================
   Express Setup
============================= */
const app = express();
app.use(cors());
app.use(express.json());

/* =============================
   Setup Groq (SAME AS YOUR CODE)
============================= */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =============================
   Setup MCP Client (SAME)
============================= */
const serverPath = path.resolve(__dirname, "./mcp-server/mcpServer.js");

const transport = new StdioClientTransport({
  command: "node",
  args: [serverPath],
});

const mcpClient = new Client({
  name: "calendar-ai-client",
  version: "1.0.0",
});

await mcpClient.connect(transport);

console.log("✅ Connected to MCP server");

/* =============================
   Messages Memory (SAME)
============================= */
let messages = [];

/* =============================
   CHAT API (converted from readline)
============================= */
app.post("/chat", async (req, res) => {
  const message = req.body.message;

  try {
    /* 1. Fetch fresh tools (SAME) */
    const { tools } = await mcpClient.listTools();

    const groqTools = tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema,
      },
    }));

    /* 2. System Prompt (SAME) */
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
    });

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

    /* 3. Build history (SAME) */
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

    /* memory trim (SAME) */
    messages = [messages[0], ...messages.slice(-20)];

    /* 4. First LLM Call (SAME) */
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: groqTools,
      tool_choice: "auto",
    });

    let assistantMsg = response.choices[0].message;
    messages.push(assistantMsg);

    /* 5. Tool calls (SAME) */
    if (assistantMsg.tool_calls) {
      for (const call of assistantMsg.tool_calls) {
        const result = await mcpClient.callTool({
          name: call.function.name,
          arguments: call.function.arguments
            ? JSON.parse(call.function.arguments)
            : {},
        });

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content:
            result.content?.[0]?.text || "Tool executed",
        });
      }

      /* 6. Second LLM Call (SAME) */
      const finalResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tools: groqTools,
        tool_choice: "none",
      });

      const reply = finalResponse.choices[0].message.content;

      messages.push({ role: "assistant", content: reply });

      return res.json({ reply });
    }

    /* normal reply */
    res.json({ reply: assistantMsg.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   Start server
============================= */
app.listen(5000, () =>
  console.log("🚀 Backend running at http://localhost:5000")
);
