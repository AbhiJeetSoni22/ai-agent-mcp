import { getGoogleClient } from "../services/googleService.js";

export const executeToolCalls = async ({
  toolCalls,
  mcpClient,
  userId,
}) => {
  try {
    console.log('user id in toolExecutor', userId)
    // 🔥 Step 1: Get Google Auth Client from backend
    const authClient = await getGoogleClient(userId);

    const access_token = authClient.credentials.access_token;
    const refresh_token = authClient.credentials.refresh_token;

    if (!access_token) {
      throw new Error("Access token missing");
    }

    const results = [];

    // 🔥 Step 2: Execute each tool call
for (const tool of toolCalls) {
  const toolName = tool.function.name;

  let args = {};
  try {
    args = JSON.parse(tool.function.arguments || "{}");
  } catch (err) {
    console.error("Parse error:", err.message);
  }

  const result = await mcpClient.callTool({
    name: toolName,
    arguments: {
      ...args,
      access_token,
      refresh_token,
    },
  });

  results.push({
    role: "tool",
    tool_call_id: tool.id, // ✅ VERY IMPORTANT
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