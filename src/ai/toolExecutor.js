
export const executeToolCalls = async (mcpClient, toolCalls, userId) => {
  const toolMessages = [];

  for (const call of toolCalls) {
    const toolName = call.function.name;

    const args = JSON.parse(call.function.arguments);

    let result;

    try {
      result = await mcpClient.callTool(toolName, {
        ...args,
        userId, // 🔥 ONLY THIS
      });
    } catch (err) {
      console.error("❌ TOOL ERROR:", toolName, err.message);

      result = {
        error: "Tool execution failed",
      };
    }

    toolMessages.push({
      role: "tool",
      tool_name: toolName,
      content: JSON.stringify(result),
    });
  }

  return toolMessages;
};