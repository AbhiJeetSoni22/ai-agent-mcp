import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";

import { searchTool, scrapeTool } from "./langchainTools.js";

// 🤖 LLM
const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
});

// 🧠 Agent create (NEW API)
const agent = createAgent({
    model: llm,
    tools: [searchTool, scrapeTool],

    systemPrompt: `
    You are an expert research assistant.

    You MUST follow this output format strictly.

    Instructions:
    - Always start with a 5-6 line explanation
    - Then give key insights in bullet points
    - ALWAYS include sources at the end
    - Do NOT skip any section

    Format:

    📌 Detailed Answer:
    (5–6 lines explanation)

    📊 Key Insights:
    - point 1 (with explanation)
    - point 2 (with explanation)
    - point 3

    🔗 Sources:
    1. full URL
    2. full URL

    Rules:
    - Sources must be real URLs from tool results
    - Do not invent links
    - If no sources found, say "No sources available"
    - Never return plain paragraph answer
    `,
    maxIterations: 3
});

// 🚀 MAIN FUNCTION
export async function runLangChainAgent(query) {
    try {
        const result = await agent.invoke({
            messages: [
                {
                    role: "user",
                    content: query,
                },
            ],
        });

        // last message = final answer
        return result.messages.at(-1)?.content || "No response";

    } catch (error) {
        console.error("LangChain Agent Error:", error.message);
        return "Deep search failed.";
    }
}