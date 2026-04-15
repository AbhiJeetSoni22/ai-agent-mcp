import { tool } from "@langchain/core/tools";
import { z } from "zod";

import {
  tavilyStructuredSearch,
  scraperTool,
} from "../../mcp-server/tools/webSearchTools.js";

// 🔍 Search Tool
export const searchTool = tool(
  async (input) => {
    const { query } = input;

    const results = await tavilyStructuredSearch(query);

    return JSON.stringify(
      results.slice(0, 4).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
      }))
    );
  },
  {
    name: "search_web",
    description: "Search the web for latest information",
    schema: z.object({
      query: z.string(),
    }),
  }
);

// 🕷️ Scraper Tool
export const scrapeTool = tool(
  async (input) => {
    const { url } = input;

    const content = await scraperTool(url);

    return content
      ? content.substring(0, 2000)
      : "No content available";
  },
  {
    name: "scrape_webpage",
    description: "Extract content from a webpage URL",
    schema: z.object({
      url: z.string(),
    }),
  }
);