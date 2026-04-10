import { User } from "../models/User.js"; // ✅ add this

export const executeToolCalls = async ({
  toolCalls,
  mcpClient,
  userId,
}) => {
  try {
    console.log("user id in toolExecutor", userId);

    // 🔥 Google Auth
    const authClient = await getGoogleClient(userId);

    const access_token = authClient.credentials.access_token;
    const refresh_token = authClient.credentials.refresh_token;

    if (!access_token) {
      throw new Error("Access token missing");
    }

    // 🔥 Fetch user (for GitHub token)
    const user = await User.findOne({ googleId: userId });
    const github_token = user?.github_token;

    const results = [];

    const githubTools = [
      "list_repos",
      "create_repo",
      "create_issue",
      "list_issues",
    ];

    for (const tool of toolCalls) {
      const toolName = tool.function.name;

      let args = {};
      try {
        args = JSON.parse(tool.function.arguments || "{}");
      } catch (err) {
        console.error("Parse error:", err.message);
      }

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

        continue; // skip actual execution
      }

      // ✅ Normal execution
      const result = await mcpClient.callTool({
        name: toolName,
        arguments: JSON.stringify({
          ...args,
          access_token,
          refresh_token,
          github_token, // ✅ pass if exists
        }),
      });

      results.push({
        role: "tool",
        tool_call_id: tool.id,
        name: toolName,
        content: JSON.stringify(result),
      });
    }

    return results;
  } catch (error) {
    console.error("❌ Tool Execution Error:", error.message);
    throw error;
  }
};