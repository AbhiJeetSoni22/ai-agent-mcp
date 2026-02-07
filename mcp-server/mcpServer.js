import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { calendarTools } from "./tools/calendarTools.js";
import { webSearchTools } from "./tools/webSearchTools.js";
import { gmailTools } from "./tools/gmailTools.js";

const server = new McpServer({
  name: "calendar-mcp-server",
  version: "1.0.0",
});

/*
  Register tools using the latest non-deprecated method
*/

const allTools = [
  ...calendarTools,
  ...webSearchTools,
  ...gmailTools,
];
for (const tool of allTools) {
  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.schema, // This is where the schema actually goes!
    },
    tool.handler,
  );
}

// Ensure NO console.logs are here!
const transport = new StdioServerTransport();
await server.connect(transport);
