# AI Agent — MCP Backend

This repository contains the backend pieces for the AI Agent project which integrates with a Model Context Protocol (MCP) server, Google APIs, and GROQ. The backend provides an Express API used by the frontend and manages MCP services and tools. It includes MongoDB for data persistence, Redis for caching, and comprehensive Google OAuth authentication.

**Note:** The file `helper-server.js` in the project root is not part of the main backend runtime for this repository and can be ignored for normal development and deployment.

**Project Layout**
- `src/` — main backend source
  - `server.js` — Express server and route mounting (default port: 5000)
  - `routes/` — API routes
    - `auth.route.js` — Google OAuth and authentication endpoints
    - `chat.route.js` — chat API route used by the frontend
  - `controllers/` — request handlers
    - `authController.js` — handles Google OAuth flow, login, callback, and logout
  - `models/` — MongoDB schemas
    - `User.js` — user data model with Google OAuth and GitHub token support
  - `middleware/` — Express middleware
    - `authMiddleware.js` — JWT token verification for protected routes
  - `services/` — business logic
    - `googleService.js` — Google API utilities
    - `userService.js` — user management and database operations
  - `ai/` — AI-related code
    - `chatHandler.js` — route handler and chat orchestration
    - `prompts.js` — prompt templates for the AI agent
    - `toolExecutor.js` — executes tools for the agent
    - `services/ToolSelection.js` — GROQ-powered intelligent tool selection based on user queries
  - `config/` — client and service initialization
    - `db.js` — MongoDB connection and initialization
    - `redisClient.js` — Redis client for caching (Upstash)
    - `googleClient.js` — Google OAuth2 client (uses env vars)
    - `googleOAuth.js` — Google OAuth configuration
    - `groqClient.js` — GROQ client for LLM operations (uses env vars)
    - `mcpClient.js` — starts/connects an MCP client that launches `mcp-server/mcpServer.js`
  - `utils/` — utility functions
    - `crypto.js` — encryption/decryption utilities

- `mcp-server/` — the MCP server used by the backend
  - `mcpServer.js` — MCP server entry point
  - `services/` — high-level service implementations
    - `calendarService.js` — Google Calendar integration service
    - `githubService.js` — GitHub API integration service
    - `gmailService.js` — Gmail integration service
  - `tools/` — lower-level tools and API helpers
    - `calendarTools.js` — calendar operations (list, create, update events)
    - `githubTools.js` — GitHub operations (repos, issues, pull requests)
    - `gmailTools.js` — Gmail operations (read, send emails)
    - `webSearchTools.js` — web search using Tavily API
  - `utils/` — shared utilities
    - `googleService.js` — Google API client helpers

- `scripts/` — utilities and auth helpers
  - `getRefreshToken.js` — obtains Google refresh tokens for service account access
  - `gmailAuth.js` — Gmail authentication helper

- `package.json` — contains `start` and `dev` scripts

**Key files to know**
- `src/server.js` — starts the Express API on port 5000 and mounts routes.
- `src/routes/auth.route.js` — Google OAuth routes and callback handler.
- `src/controllers/authController.js` — handles the complete OAuth flow, user creation, token encryption, and session management.
- `src/config/db.js` — initializes MongoDB connection on app startup.
- `src/config/redisClient.js` — initializes Upstash Redis client for caching.
- `src/models/User.js` — defines user schema with support for Google OAuth and GitHub tokens.
- `src/ai/services/ToolSelection.js` — uses GROQ to intelligently select relevant tools based on user queries.
- `src/config/mcpClient.js` — launches the MCP server process from `mcp-server/mcpServer.js` using a stdio transport.
- `src/config/googleClient.js` — reads Google OAuth credentials from environment variables.

**Environment variables**
Create a `.env` file in the project root with at least the following values:

**Google OAuth & APIs**
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `GOOGLE_REFRESH_TOKEN` — refresh token for Google API service account access

**Database & Caching**
- `MONGO_URI` — MongoDB connection URI (e.g., `mongodb://localhost:27017/ai-agent`)
- `REDIS_URL` — Upstash Redis URL
- `REDIS_TOKEN` — Upstash Redis token

**AI & External APIs**
- `GROQ_API_KEY` — GROQ API key for LLM operations
- `TAVILY_API_KEY` — Tavily API key for web search functionality

**Security**
- `JWT_SECRET` — secret key for signing JWT tokens in cookies

**Optional**
- `GITHUB_TOKEN` — GitHub API token (optional, for GitHub integration)

Other env values may be required depending on additional integrations you enable.

**Authentication & User Management**
This backend includes comprehensive Google OAuth authentication with JWT-based sessions and persistent user data in MongoDB.

**OAuth Flow:**
- `GET /auth/google` — redirects the user to Google OAuth consent screen
- `GET /auth/google/callback` — handles Google callback, creates/updates user in database, encrypts tokens, issues a `token` cookie, and redirects to frontend at `http://localhost:5173/chat`
- `GET /auth/me` — returns the authenticated user when the request includes a valid cookie
- `GET /auth/logout` — clears the auth cookie and logs the user out

**User Data Storage:**
User information is stored in MongoDB with the following fields:
- `googleId` — Google ID
- `email` — user email
- `name` — user display name
- `access_token` — encrypted Google access token
- `refresh_token` — encrypted Google refresh token
- `expiry_date` — token expiration timestamp
- `github_token` — optional GitHub token for GitHub integration

Tokens are encrypted using AES-256 cipher before storage (see `src/utils/crypto.js`).

**Authentication middleware** (implemented in `src/middleware/authMiddleware.js`):
- Verifies JWT tokens stored in HTTP-only cookies named `token`
- Protects routes from unauthorized access
- Decrypts user tokens for API calls

**CORS and session support**
The server is configured in `src/server.js` to allow requests from `http://localhost:5173` and to accept credentials so the frontend can send and receive auth cookies.

**MCP Services & Tools**
The backend provides multiple integrated services through the MCP server:

**Services** (mcp-server/services/):
- `calendarService.js` — Google Calendar operations via calendar tools
- `gmailService.js` — Gmail operations (read and send emails) via gmail tools
- `githubService.js` — GitHub operations (repositories, issues, PRs) via github tools

**Tools** (mcp-server/tools/):
- `calendarTools.js` — list, create, and update calendar events
- `gmailTools.js` — read emails and send messages
- `githubTools.js` — search repositories, list issues, and manage PRs
- `webSearchTools.js` — web search using Tavily API for real-time information

**Tool Selection:**
The `src/ai/services/ToolSelection.js` module uses GROQ to intelligently analyze user queries and select only the most relevant tools. This reduces unnecessary API calls and improves response quality.

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
- **Database:** MongoDB is required for user storage. Initialize connection with `src/config/db.js` — called automatically on server startup.
- **Caching:** Redis (Upstash) is used for caching. Initialize with `src/config/redisClient.js`.
- **User Tokens:** Google tokens are encrypted before storage using AES-256 cipher (see `src/utils/crypto.js`). Decryption happens on-demand in API calls.
- **MCP Client:** Created in `src/config/mcpClient.js` and expects `mcp-server/mcpServer.js` to be available; this file is launched as a child process using Node.
- **Services:** Live under `mcp-server/services/` and use helpers in `mcp-server/tools/` for auth and API calls.
- **Tool Selection:** The `src/ai/services/ToolSelection.js` module analyzes user queries using GROQ and returns an array of relevant tool names to execute.
- **To add a new tool/service:** follow the existing patterns in `mcp-server/tools` and `mcp-server/services`, create the service/tool pair, and register them with the MCP server in `mcp-server/mcpServer.js`.

**Troubleshooting**
- **MongoDB connection fails:** Ensure `MONGO_URI` is set correctly in `.env` and MongoDB is running.
- **Redis connection fails:** Ensure `REDIS_URL` and `REDIS_TOKEN` are set correctly for Upstash Redis.
- **MCP client fails to connect:** Check that `mcp-server/mcpServer.js` has no syntax issues and that Node can spawn child processes on your platform.
- **Google OAuth fails:** Ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` are correct in `.env`, and the callback URL is registered in Google Cloud Console.
- **Google API calls fail:** Verify `GOOGLE_REFRESH_TOKEN` is valid and that the required OAuth scopes are requested (Gmail, Calendar).
- **Tool selection returns empty array:** Check that `GROQ_API_KEY` is valid and that tool descriptions are clear in the tool definitions.
- **Token encryption/decryption errors:** Verify `JWT_SECRET` is set and hasn't changed between sessions.

**Next steps & Tips**
- **Logging:** Add detailed logging in `src/config/mcpClient.js` to surface child process errors and MCP communication issues.
- **Error handling:** Wrap tool execution with try-catch in `src/ai/toolExecutor.js` to gracefully handle API failures.
- **Token refresh:** Implement automatic Google token refresh when `expiry_date` is reached (consider using a cron job).
- **Rate limiting:** Add rate limiting middleware to prevent abuse of API endpoints, especially tool execution.
- **Security:** Store secrets securely for production (e.g., use AWS Secrets Manager, Azure Key Vault, or similar rather than a local `.env`).
- **Database indexes:** Add MongoDB indexes on frequently queried fields like `googleId` and `email` for better performance.
- **Caching strategy:** Use Redis to cache tool results and user preferences to reduce API calls.
- **Testing:** Add unit tests for `ToolSelection.js`, `toolExecutor.js`, and authentication controllers.

---
Updated: April 2026 — Backend now includes MongoDB persistence, Redis caching, intelligent tool selection, and comprehensive Google OAuth.
