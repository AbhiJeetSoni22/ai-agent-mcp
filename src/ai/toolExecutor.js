import { User } from "../models/User.js";
import { getGoogleClient } from "../services/googleService.js";
import { decrypt } from "../utils/crypto.js";


// ✅ helper
const safeParseArgs = (args) => {
  if (!args) return {};

  if (typeof args === "string") {
    try {
      return JSON.parse(args);
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      return {};
    }
  }

  return args;
};

export const executeToolCalls = async ({
  toolCalls,
  mcpClient,
  userId,
}) => {
  try {
    console.log("user id in toolExecutor", userId);

    // 🔥 Google Auth (Backend responsibility ✅)
    const authClient = await getGoogleClient(userId);

    const access_token = authClient.credentials.access_token;
    const refresh_token = authClient.credentials.refresh_token;

    if (!access_token) {
      throw new Error("Access token missing");
    }

    // 🔥 GitHub token (still backend responsibility ✅)
    const user = await User.findOne({ googleId: userId });

    let github_token = user?.github_token;

    if (github_token) {
      github_token = decrypt(github_token);
    }

    const results = [];

    const githubTools = [
      "list_repos",
      "create_repo",
      "create_issue",
      "list_issues",
    ];

    for (const tool of toolCalls) {
      const toolName = tool.function.name;

      // ✅ FIX: safe parsing
      const parsedArgs = safeParseArgs(tool.function.arguments);

      // 🔥 GitHub token check
      if (githubTools.includes(toolName) && !github_token) {
        results.push({
          role: "tool",
          tool_call_id: tool.id,
          name: toolName,
          content: JSON.stringify({
            content: [
              {
                type: "text",
                text: "⚠️ Please provide your GitHub token to use GitHub features.",
              },
            ],
            isError: true,
          }),
        });

        continue;
      }

      try {
        // ✅ CRITICAL FIX: send OBJECT, NOT STRING
        const result = await mcpClient.callTool({
          name: toolName,
          arguments: {
            ...parsedArgs,
            access_token,
            refresh_token,
            github_token,
          },
        });

        results.push({
          role: "tool",
          tool_call_id: tool.id,
          name: toolName,
          content: JSON.stringify(result),
        });

      } catch (err) {
        console.error("❌ Tool call failed:", err.message);

        results.push({
          role: "tool",
          tool_call_id: tool.id,
          name: toolName,
          content: JSON.stringify({
            error: err.message,
          }),
        });
      }
    }

    return results;

  } catch (error) {
    console.error("❌ Tool Execution Error:", error.message);
    throw error;
  }
};