import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

const serverPath = path.resolve("./mcp-server/mcpServer.js");

const transport = new StdioClientTransport({
  command: "node",
  args: [serverPath],
});

export const mcpClient = new Client({
  name: "calendar-ai-client",
  version: "1.0.0",
});

await mcpClient.connect(transport);

