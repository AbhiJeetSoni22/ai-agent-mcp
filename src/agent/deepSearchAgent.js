import {
    tavilyStructuredSearch,
    scraperTool,
} from "../../mcp-server/tools/webSearchTools.js";
import { groq } from "../config/groqClient.js";
import { createDeepSearchPrompt } from '../ai/prompts.js'


// 🔥 filter trusted sources
function isHighQualitySource(url) {
    const trustedDomains = [
        "mit.edu",
        "microsoft.com",
        "openai.com",
        "google.com",
        "github.com",
        "arxiv.org",
        "bbc.com",
        "forbes.com",
        "nature.com",
        "sciencedirect.com",
    ];

    return trustedDomains.some((domain) => url.includes(domain));
}

function removeDuplicateLines(text) {
    const lines = text.split("\n");
    return [...new Set(lines)].join("\n");
}

export async function runDeepSearchAgent(query) {
    try {
        // 🔍 STEP 1: SEARCH
        const searchResults = await tavilyStructuredSearch(query);

        if (!searchResults.length) {
            return "No relevant results found.";
        }

        // 🎯 STEP 2: PICK TOP RESULTS
        const selectedIndices = await rankLinksWithLLM(query, searchResults);

        const topResults = selectedIndices.map((i) => searchResults[i]);

        // 🕷️ STEP 3: SCRAPE CONTENT (parallel)
        const scrapedContents = await Promise.all(
            topResults.map(async (r) => {
                try {
                    const content = await scraperTool(r.url);
                    return content && content.length > 200 ? content : "";
                } catch {
                    return "";
                }
            })
        );
        // 🧠 STEP 4: PREPARE CONTEXT
        let combinedContent = "";

        topResults.forEach((r, i) => {
            const content = scrapedContents[i];

            const optimizedContent = extractRelevantContent(content, query);

            combinedContent += `
                    Source ${i + 1}:
                    Title: ${r.title}
                    URL: ${r.url}
                    ${optimizedContent
                    ? `Content: ${optimizedContent}`
                    : `Snippet: ${r.snippet}`
                }
`;
        });

        combinedContent = removeDuplicateLines(combinedContent);
        const deepSearchPrompt = createDeepSearchPrompt(query, combinedContent)

        if (combinedContent.length > 12000) {
            combinedContent = combinedContent.substring(0, 12000);
        }
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

async function rankLinksWithLLM(query, results) {
    try {
        const formattedResults = results
            .map(
                (r, i) =>
                    `${i + 1}. Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`
            )
            .join("\n\n");

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert research assistant. Select the most relevant and high-quality sources.",
                },
                {
                    role: "user",
                    content: `
Query:
${query}

Search Results:
${formattedResults}

Instructions:
- Select top 3 most relevant results
- Prefer reliable sources (news, research, official blogs)
- Avoid spam or low-quality content
- Return ONLY indices (e.g., 1,3,5)

Output:
1,2,3
`,
                },
            ],
        });

        const text = completion.choices[0].message.content;

        // extract numbers
        const indices = text
            .match(/\d+/g)
            ?.map((n) => parseInt(n) - 1) || [];

        return indices.slice(0, 3);

    } catch (err) {
        console.error("Ranking Error:", err.message);
        return [0, 1, 2]; // fallback
    }
}



// 🔥 helper function (top of file)
function extractRelevantContent(content, query) {
    if (!content) return "";

    const sentences = content.split(". ");

    const relevant = sentences.filter((sentence) =>
        query
            .toLowerCase()
            .split(" ")
            .some((word) => sentence.toLowerCase().includes(word))
    );

    const finalContent =
        relevant.length > 0 ? relevant.slice(0, 5) : sentences.slice(0, 5);

    return finalContent.join(". ");
}