import { authorize } from "../mcp-server/services/gmailService.js";

await authorize();

console.log("✅ Gmail authorized successfully. You can now start MCP server.");
process.exit();
