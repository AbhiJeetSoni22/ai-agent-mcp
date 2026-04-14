import {
  tavilyStructuredSearch,
  scraperTool,
} from "../../mcp-server/tools/webSearchTools.js";
import { groq } from "../config/groqClient.js";
import {createDeepSearchPrompt} from '../ai/prompts.js'


export async function runDeepSearchAgent(query) {
  try {
    // 🔍 STEP 1: SEARCH
    const searchResults = await tavilyStructuredSearch(query);

    if (!searchResults.length) {
      return "No relevant results found.";
    }

    // 🎯 STEP 2: PICK TOP RESULTS
    const topResults = searchResults.slice(0, 4);

    // 🕷️ STEP 3: SCRAPE CONTENT (parallel)
    const scrapedContents = await Promise.all(
      topResults.map(async (r) => {
        const content = await scraperTool(r.url);
        return content || ""; // fallback safe
      })
    );

    // 🧠 STEP 4: PREPARE CONTEXT
    let combinedContent = "";

    topResults.forEach((r, i) => {
      const content = scrapedContents[i];

      combinedContent += `
        Source ${i + 1}:
        Title: ${r.title}
        URL: ${r.url}
        ${content ? `Content: ${content}` : `Snippet: ${r.snippet}`}
      
    `;
    });
    const deepSearchPrompt =  createDeepSearchPrompt(query,combinedContent)
    // 🤖 STEP 5: GROQ SUMMARIZATION
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: deepSearchPrompt  
        },
      ],
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error("Deep Search Agent Error:", error.message);
    return "Something went wrong during deep search.";
  }
}