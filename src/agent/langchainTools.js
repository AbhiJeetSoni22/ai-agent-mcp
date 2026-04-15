import { tool } from "@langchain/core/tools";
import {
  tavilyStructuredSearch,
  scraperTool,
} from "../../mcp-server/tools/webSearchTools.js";

// 🔍 Search Tool
export const searchTool = tool(
  async ({ query }) => {
    const results = await tavilyStructuredSearch(query);

    return JSON.stringify(
      results.slice(0, 4).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet.substring(0, 200), // 🔥 trim
      }))
    );
  },
  {
    name: "search_web",
    description: "Search the internet for latest information",
  }
);

// 🕷️ Scraper Tool
export const scrapeTool = tool(
  async ({ url }) => {
    const content = await scraperTool(url);

    if (!content) return "No content available";

    return content.substring(0, 2000); // 🔥 limit tokens
  },
  {
    name: "scrape_webpage",
    description: "Extract detailed content from a given URL",
  }
);