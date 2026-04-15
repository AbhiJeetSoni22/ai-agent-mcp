import { ChatGroq } from "@langchain/groq";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";

import { searchTool, scrapeTool } from "./langchainTools.js";

// 🤖 LLM setup
const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
});

export async function runLangChainAgent(query) {
    try {
        const tools = [searchTool, scrapeTool];

        const agent = await createToolCallingAgent({
            llm,
            tools,
            systemPrompt: `
                You are a smart research agent.

                Rules:
                - Always call search_web first for unknown queries
                - Use scrape_webpage only for top 1-2 important links
                - Do NOT scrape all links
                - Stop once you have enough information
                - Keep tool usage minimal
                - Avoid repeated tool calls

                Goal:
                Provide a high-quality, concise answer with sources.
                `,
        });
        const executor = new AgentExecutor({
            agent,
            tools,
            verbose: true, // 🔥 logs for debugging
            maxIterations: 4,
        });

        const result = await executor.invoke({
            input: query,
        });

        return result.output;

    } catch (error) {
    //         console.error("LangChain failed, fallback triggered");

    // // 🔥 fallback to manual agent
    // const { runDeepSearchAgent } = await import("./deepSearchAgent.js");
    // return await runDeepSearchAgent(query);
        console.error("LangChain Agent Error:", error.message);
        return "Deep search failed.";
    }
}