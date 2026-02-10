export async function executeToolCalls(mcpClient, calls) {
  const results = [];

  for (const call of calls) {
    let parsedArgs = {};

        if (call.function.arguments) {
          try {
            parsedArgs = JSON.parse(call.function.arguments) || {};
          } catch {
            parsedArgs = {};
          }
        }
  
    const result = await mcpClient.callTool({
      name: call.function.name,
      arguments:parsedArgs,
    });

    results.push({
      role: "tool",
      tool_call_id: call.id,
      content: JSON.stringify(result),
    });
  }

  return results;
}
