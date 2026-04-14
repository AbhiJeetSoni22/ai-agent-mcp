import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

const schema = z.object({
  query: z.string().describe("Search query to find current information"),
});

async function handler({ query }) {
  try {
    const response = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: 5,
      }
    );

    const results = response.data.results;

    if (!results || results.length === 0) {
      return {
        content: [{ type: "text", text: "No results found." }],
      };
    }

    const formatted = results
      .map(
        (r, i) =>
          `${i + 1}. ${r.title}\n${r.url}\n${r.content}`
      )
      .join("\n\n");

    return {
      content: [{ type: "text", text: formatted }],
    };
  } catch (err) {
    return {
      content: [
        { type: "text", text: `Search failed: ${err.message}` },
      ],
      isError: true,
    };
  }
}

export const webSearchTools = [
  {
    name: "web_search",
    description: "Search the web for real-time information",
    schema,
    handler,
  },
];

export async function tavilyStructuredSearch(query) {
  try {
    const response = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: 5,
      }
    );

    const results = response.data.results;

    if (!results || results.length === 0) return [];

    // ✅ Structured format for Deep Search
    return results.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
    }));

  } catch (err) {
    console.error("Structured Search Error:", err.message);
    return [];
  }
}

export async function scraperTool(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Referer": "https://www.google.com/", // 🔥 important
      },
      timeout: 10000,
      validateStatus: () => true, // ❗ handle non-200 manually
    });

    // ❌ Handle blocked / failed responses
    if (response.status !== 200) {
      console.warn(`Scraper skipped (${response.status}): ${url}`);
      return "";
    }

    const html = response.data;

    const $ = cheerio.load(html);

    // ❌ remove unwanted elements
    $("script, style, noscript, iframe, header, footer, nav, aside").remove();

    let text = $("body").text();

    // ✅ clean text
    text = text.replace(/\s+/g, " ").trim();

    // ❌ ignore too small content (garbage pages)
    if (text.length < 200) {
      return "";
    }

    // ⚠️ limit content
    const MAX_LENGTH = 3000;
    if (text.length > MAX_LENGTH) {
      text = text.substring(0, MAX_LENGTH);
    }

    return text;

  } catch (error) {
    console.warn("Scraper Error:", error.message);
    return "";
  }
}