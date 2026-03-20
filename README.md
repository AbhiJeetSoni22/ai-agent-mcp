# AI Agent — MCP Backend

This repository contains the backend pieces for the AI Agent project which integrates with a Model Context Protocol (MCP) server, Google APIs, and GROQ. The backend provides an Express API used by the frontend and manages MCP services and tools.

**Note:** The file `helper-server.js` in the project root is not part of the main backend runtime for this repository and can be ignored for normal development and deployment.

**Project Layout**
- `src/` — main backend source
  - `server.js` — Express server and route mounting (default port: 5000)
  - `routes/chat.route.js` — chat API route used by the frontend
  - `ai/` — AI-related code
    - `chatHandler.js` — route handler and orchestration
    - `prompts.js` — prompt templates
    - `toolExecutor.js` — executes tools for the agent
  - `config/` — client initialization
    - `googleClient.js` — Google OAuth2 client (uses env vars)
    - `groqClient.js` — GROQ client (uses env vars)
    - `mcpClient.js` — starts/connects an MCP client that launches `mcp-server/mcpServer.js`

- `mcp-server/` — the MCP server used by the backend
  - `mcpServer.js` — MCP server entry
  - `services/` — high-level service implementations (calendar, github, gmail)
  - `tools/` — lower-level tools and auth helpers used by services

- `scripts/` — utilities and auth helpers (e.g. `getRefreshToken.js`)

- `package.json` — contains `start` and `dev` scripts

**Key files to know**
- `src/server.js` — starts the Express API on port 5000 and mounts `/chat`.
- `src/config/mcpClient.js` — launches the MCP server process from `mcp-server/mcpServer.js` using a stdio transport.
- `src/config/googleClient.js` — reads Google OAuth credentials from environment variables.

**Environment variables**
Create a `.env` file in the project root with at least the following values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN` (used by Google API helpers)
- `GROQ_API_KEY` (for GROQ client)

Other env values may be required depending on additional integrations you enable.

**Install & Run**
Prerequisites: Node.js (v18+ recommended) and npm.

Install dependencies:

```
npm install
```

Run in development (auto-reload via `nodemon`):

```
npm run dev
```

Run production:

```
npm start
```

Useful scripts from `package.json`:
- `npm run token` — runs `scripts/getRefreshToken.js` to help obtain Google refresh tokens.

**Development notes**
- The MCP client is created in `src/config/mcpClient.js` and expects `mcp-server/mcpServer.js` to be available; this file is launched as a child process using Node.
- Services live under `mcp-server/services/` and use helpers in `mcp-server/tools/` for auth and API calls.
- To add a new tool/service, follow the existing patterns in `mcp-server/tools` and `mcp-server/services` and register them with the MCP server.

**Troubleshooting**
- If the MCP client fails to connect, check that `mcp-server/mcpServer.js` has no syntax issues and that Node can spawn child processes on your platform.
- If Google API calls fail, ensure the `.env` values are correct and that the refresh token is valid.

**Next steps & Tips**
- Add helpful logging around the MCP server start in `src/config/mcpClient.js` to surface child process errors.
- Store secrets securely for production (e.g., use a secrets manager rather than a local `.env`).

---
Generated README for the `ai-agent-mcp-backend` folder.
