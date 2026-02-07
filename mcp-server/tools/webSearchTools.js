import { z } from "zod";
import axios from "axios";

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
