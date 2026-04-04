import { getGoogleClient } from "../services/googleService.js";

export const executeToolCalls = async (mcpClient, toolCalls, userId) => {
  const toolMessages = [];

  for (const call of toolCalls) {
    const toolName = call.function.name;
    const args = JSON.parse(call.function.arguments);

    let result;

    // 🔥 Inject user-specific Google client
    if (toolName.includes("gmail") || toolName.includes("calendar")) {
      const authClient = await getGoogleClient(userId);

      result = await mcpClient.callTool(toolName, {
        ...args,
        auth: authClient, // 🔥 inject here
      });
    } else {
      result = await mcpClient.callTool(toolName, args);
    }

    toolMessages.push({
      role: "tool",
      tool_name: toolName,
      content: JSON.stringify(result),
    });
  }

  return toolMessages;
};