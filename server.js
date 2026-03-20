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
const conversations = new Map();

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
   CHAT API (converted from readline)
============================= */
app.post("/chat", async (req, res) => {
  const message = req.body.message;

  try {
    /* 1. Fetch fresh tools (SAME) */
    const { tools } = await mcpClient.listTools();

    const msg = message.toLowerCase();

    let filteredTools = tools;

    // GitHub
    if (msg.includes("repo") || msg.includes("github")) {
      filteredTools = tools.filter(
        (t) => t.name.includes("repo") || t.name.includes("issue"),
      );
    }


    // Calendar
    else if (
      msg.includes("event") ||
      msg.includes("calendar") ||
      msg.includes("meeting")
    ) {
      filteredTools = tools.filter((t) =>
        t.name.toLowerCase().includes("event"),
      );
    }

    // Default → no tools
    else {
      filteredTools = [];
    }

    const groqTools = filteredTools.map((t) => ({
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



            DATE & TIME LOGIC:
            - Interpret relative words like today, tomorrow, yesterday, next week using the current date above.
            - Convert all dates to ISO format.
            - Convert times like "5 PM" into 24-hour format (17:00:00).
            - Always generate valid ISO 8601 datetime strings when time is involved.
            - When creating times, always include timezone offset (+05:30).
                Do not use Z or UTC.

            TOOLS USAGE:
            - Use available tools whenever real-world actions or data retrieval are needed.
            - If a tool exists that can answer the user's request, ALWAYS call the tool.
            - If no tool is relevant, answer normally.
            - NEVER say you don't have access.
            - Authentication for GitHub, Gmail, and Calendar is already handled by the backend.
            - Some tools (like listing GitHub repositories or unread emails) require NO parameters.
            - Even if parameters are empty, you MUST call the tool.


            IMPORTANT:
            - Only call tools using the provided tool calling system.
            - Never output <function> or XML-like tags.

            TOOL SAFETY RULES:

            - NEVER call a tool if required parameters are missing.
            - If information is incomplete, ask follow-up questions.
            - Only call tools when ALL required fields are clearly provided.
            - Do NOT assume or guess missing values.

            BEHAVIOR:
            - Be concise and helpful.
            - Do not say you lack access or mention being an AI.`;

    const sessionId = req.headers["x-session-id"] || "default";

    let history = conversations.get(sessionId) || [];

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    /* 4. First LLM Call (SAME) */
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: groqTools,
      temperature: 0,
      tool_choice: "auto",
    });

    let assistantMsg = response.choices[0].message;
    // Detect tool-required queries
    console.log("assitantMsg", assistantMsg);

    messages.push(assistantMsg);

    /* 5. Tool calls (SAME) */
    if (assistantMsg.tool_calls) {
      for (const call of assistantMsg.tool_calls) {
        let parsedArgs = {};

        if (call.function.arguments) {
          try {
            parsedArgs = JSON.parse(call.function.arguments) || {};
          } catch {
            parsedArgs = {};
          }
        }
       
        const result = await mcpClient.callTool({
          name: call.function.name,
          arguments: parsedArgs,
        });
        console.log("result is ", result);

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result), // ⭐ VERY IMPORTANT
        });
      }
      messages.push({
        role: "system",
        content: `
          Use ONLY the tool result JSON provided.

          FORMAT RULES:
          - Do NOT write paragraphs
          - Use bullet points or numbered list
          - One item per line
          - Keep it clean and short
          - Do NOT invent any extra data
          - Only show fields present in the tool result

          If listing:
          - repositories → show name
          - issues → show number, title, state, url
          - emails → show subject + sender
          - events → show title + time
          `,
      });
      /* 6. Second LLM Call (SAME) */
      const finalResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tool_choice: "none",
        temperature: 0,
      });

      const reply = finalResponse.choices[0].message.content;

      messages.push({ role: "assistant", content: reply });
      history.push({ role: "user", content: message });
      history.push({ role: "assistant", content: reply });

      // keep last 10 only
      history = history.slice(-10);

      conversations.set(sessionId, history);

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
  console.log("🚀 Backend running at http://localhost:5000"),
);
