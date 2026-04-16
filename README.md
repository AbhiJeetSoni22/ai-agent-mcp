# AI Agent — MCP Backend

An intelligent AI-powered assistant backend that leverages the Model Context Protocol (MCP) to integrate multiple services including Google Calendar, Gmail, GitHub, and web search. Built with Node.js/Express, this backend orchestrates between GROQ's LLM capabilities and specialized tools to provide smart, context-aware assistance.

**Key Features:**
- 🔐 **Google OAuth Authentication** — Secure user authentication with JWT-based sessions
- 🧠 **Intelligent Tool Selection** — GROQ-powered system that autonomously selects the best tools for each user query
- 📅 **Multi-Service Integration** — Google Calendar, Gmail, GitHub, and web search capabilities
- 💾 **Session Management** — Redis-based conversation history and caching
- 🛡️ **Protected Routes** — JWT middleware for secure API endpoints
- 🔗 **MCP Server** — Local MCP server handles tool execution and service integration

**Note:** The file `helper-server.js` in the project root is not part of the main backend runtime for this repository and can be ignored for normal development and deployment.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see Environment Variables section below)
cp .env.example .env

# Start development server with hot reload
npm run dev

# Start production server
npm start
```

The Express server runs on **port 5000** by default.

## API Endpoints

### Authentication
- `GET /auth/google` — Initiate Google OAuth flow
- `GET /auth/google/callback` — OAuth callback handler (redirects to frontend on success)
- `GET /auth/me` — Get current authenticated user (requires valid token cookie)
- `GET /auth/logout` — Clear authentication cookie and logout

### Chat API
- `POST /chat` — Send a message to the AI agent (protected route)
  - **Headers:** `x-session-id` (optional, for conversation continuity)
  - **Body:** `{ "message": "Your query here" }`
  - **Response:** AI response with tool results and conversation history

### Deep Search API (NEW)
- `POST /deep-search` — Perform an in-depth search with content scraping and analysis
  - **Body:** `{ "query": "Your search query here" }`
  - **Response:** Detailed search results with ranked sources, key insights, and full URLs
  - **Note:** Uses LangChain agent with Groq LLM for intelligent search and content analysis

## Core Features

### 🤖 AI Chat Handler
The chat system intelligently processes user queries through a multi-step flow:
1. **Tool Selection** — GROQ analyzes the query and selects relevant tools
2. **Tool Execution** — Selected tools are executed via the MCP server
3. **Response Generation** — GROQ generates a final response with context from executed tools
4. **History Management** — Conversations are cached in Redis for continuity

### 🔎 Deep Search Engine (NEW)
The deep search feature provides in-depth research capabilities using LangChain and Groq:
1. **Query Analysis** — LangChain agent understands complex research queries
2. **Web Search** — Performs initial search using Tavily API to find relevant sources
3. **Source Ranking** — LLM intelligently ranks search results by relevance and quality
4. **Content Scraping** — Extracts and analyzes content from top-ranked sources
5. **Synthesis** — Generates detailed answers with key insights and source citations
6. **Trusted Sources** — Prioritizes results from academic, tech, and authoritative domains (MIT, Microsoft, OpenAI, GitHub, arXiv, BBC, etc.)

**Features:**
- Duplicate content detection and removal
- Quality source filtering for reliability
- Parallel content scraping for speed
- Structured output with detailed explanations, key insights, and sources

### 🧠 Agent Architecture (NEW)
The backend now features a dual-agent architecture for enhanced AI capabilities:

**Main Chat Agent (MCP-based)**
- Uses the Model Context Protocol for tool integration
- Integrates with Google Calendar, Gmail, GitHub, and web search
- Intelligent tool selection via GROQ

**Deep Search Agent (LangChain-based)**
- Powered by LangChain framework with Groq LLM
- Specialized for research and in-depth information retrieval
- Tools: Web search and content scraping
- Formats output with structured insights and citations

### 🔧 Integrated Tools & Services

**Google Calendar**
- List upcoming events
- Create new events
- Update existing events
- Delete events
- Support for event details, attendees, and reminders

**Gmail**
- Read and list emails
- Send emails
- Compose with attachments
- Search emails
- Manage inbox conversations

**GitHub**
- List repositories
- View issues and pull requests
- Create issues or PRs
- Get repository statistics
- Manage project collaboration

**Web Search**
- Powered by Tavily API
- Real-time information retrieval
- Search results with context and links

### 💾 Data Persistence & Caching
- **MongoDB** — User profiles, credentials, and persistent data
- **Redis (Upstash)** — Session history (10 most recent messages, 1-hour TTL), conversation caching
- **Encrypted Storage** — Google tokens and secrets are encrypted before database storage

**Project Layout**
- `src/` — main backend source
  - `server.js` — Express server and route mounting (default port: 5000)
  - `routes/` — API routes
    - `auth.route.js` — Google OAuth and authentication endpoints
    - `chat.route.js` — chat API route used by the frontend
    - `deepSearchRoutes.js` — deep search API routes (NEW)
  - `controllers/` — request handlers
    - `authController.js` — handles Google OAuth flow, login, callback, and logout
    - `deepSearchController.js` — handles deep search requests (NEW)
  - `models/` — MongoDB schemas
    - `User.js` — user data model with Google OAuth and GitHub token support
  - `middleware/` — Express middleware
    - `authMiddleware.js` — JWT token verification for protected routes
  - `services/` — business logic
    - `googleService.js` — Google API utilities
    - `userService.js` — user management and database operations
    - `deepSearchService.js` — coordinates deep search operations (NEW)
  - `ai/` — AI-related code
    - `chatHandler.js` — route handler and chat orchestration
    - `prompts.js` — prompt templates for the AI agent and deep search
    - `toolExecutor.js` — executes tools for the agent
    - `services/ToolSelection.js` — GROQ-powered intelligent tool selection based on user queries
  - `agent/` — Advanced AI agents (NEW)
    - `deepSearchAgent.js` — deep search agent with ranking and scraping logic
    - `langchainAgent.js` — LangChain-based agent for research tasks
    - `langchainTools.js` — LangChain tool definitions (search, scrape)
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
- `src/routes/deepSearchRoutes.js` — Deep search endpoint route mapping (NEW).
- `src/controllers/authController.js` — handles the complete OAuth flow, user creation, token encryption, and session management.
- `src/controllers/deepSearchController.js` — handles deep search API requests (NEW).
- `src/config/db.js` — initializes MongoDB connection on app startup.
- `src/config/redisClient.js` — initializes Upstash Redis client for caching.
- `src/models/User.js` — defines user schema with support for Google OAuth and GitHub tokens.
- `src/ai/services/ToolSelection.js` — uses GROQ to intelligently select relevant tools based on user queries.
- `src/agent/langchainAgent.js` — LangChain agent orchestrator for deep search (NEW).
- `src/agent/deepSearchAgent.js` — Advanced search agent with ranking and content scraping (NEW).
- `src/services/deepSearchService.js` — Service layer for deep search operations (NEW).
- `src/config/mcpClient.js` — launches the MCP server process from `mcp-server/mcpServer.js` using a stdio transport.

**Environment variables**
Create a `.env` file in the project root with the following values:

**Google OAuth & APIs**
- `GOOGLE_CLIENT_ID` — OAuth client ID from [Google Cloud Console](https://console.cloud.google.com/)
- `GOOGLE_CLIENT_SECRET` — OAuth client secret
- `GOOGLE_REFRESH_TOKEN` — Refresh token for service account API access (use `npm run token` to generate)
- `GOOGLE_OAUTH_REDIRECT_URI` — Redirect URI for OAuth callback (default: `http://localhost:5000/auth/google/callback`)

**Database & Caching**
- `MONGO_URI` — MongoDB connection string (e.g., `mongodb://localhost:27017/ai-agent`)
- `REDIS_URL` — Upstash Redis connection URL
- `REDIS_TOKEN` — Upstash Redis authentication token

**AI & External Services**
- `GROQ_API_KEY` — GROQ API key for LLM operations (get from [console.groq.com](https://console.groq.com))
- `TAVILY_API_KEY` — Tavily API key for web search functionality
- `GITHUB_TOKEN` — (Optional) GitHub API token for enhanced GitHub integrations

**Security**
- `JWT_SECRET` — Secret key for signing JWT tokens (use a strong random string)
- `ENCRYPTION_KEY` — Encryption key for storing sensitive tokens (16-character string)
- `ENCRYPTION_IV` — Encryption initialization vector (16-character string)

**Development**
- `NODE_ENV` — `development` or `production`
- `PORT` — Server port (default: 5000)
- `FRONTEND_URL` — Frontend URL for CORS and redirects (default: `http://localhost:5173`)

All marked fields are required for the application to function properly. Check `.env.example` in the repository for a template.

## Authentication & Session Management

### Google OAuth Flow
The backend implements a complete OAuth 2.0 flow with JWT-based sessions:

1. **Initiation:** User clicks "Login with Google" on the frontend
2. **Consent Screen:** User is redirected to Google's OAuth consent screen
3. **Authorization:** After user approval, Google redirects to the callback endpoint
4. **Token Exchange:** Backend exchanges authorization code for tokens
5. **User Creation:** New user is created in MongoDB with encrypted tokens
6. **Session:** JWT token is issued as a secure, httpOnly cookie
7. **Redirect:** User is redirected to the frontend chat interface

**OAuth Endpoints:**
- `GET /auth/google` — redirects the user to Google OAuth consent screen
- `GET /auth/google/callback` — handles Google callback, creates/updates user in database, encrypts tokens, issues a `token` cookie, and redirects to frontend at `http://localhost:5173`

### User Data Storage
- User profiles stored in MongoDB with encrypted OAuth tokens
- GitHub tokens can be added dynamically during chat (detected by token pattern)
- All sensitive credentials are encrypted using AES-256 encryption before storage
- Token refresh handled automatically

### Protected Routes
All protected routes require JWT authentication via the `authMiddleware.js`:
- Validates token from request cookies
- Attaches user object to request (`req.user`)
- Returns 401 if token is invalid or missing

**Protected Routes:**
- `GET /auth/me` — returns the authenticated user when the request includes a valid cookie
- `POST /chat` — requires authenticated user
- `GET /auth/logout` — clears the auth cookie and logs the user out

## Chat System Architecture

### Request Flow
```
User Message
    ↓
Chat Handler (saves to Redis history)
    ↓
Tool Selection (GROQ analyzes query → selects tools)
    ↓
Tool Executor (executes MCP tools)
    ↓
GROQ Response Generator (composes final response)
    ↓
Response to Client
```

### Session Management
- Each chat session gets a unique `sessionId` (via `x-session-id` header)
- Conversation history stored in Redis with 1-hour TTL
- Last 10 messages kept per session for context
- History helps AI understand conversation context and continuity

### Tool Execution Pipeline
1. **Tool Selection** — GROQ determines which tools are relevant to the user's query
2. **Parallel Execution** — Multiple tools can execute simultaneously
3. **Result Aggregation** — All tool results are collected
4. **Response Generation** — GROQ uses tool results to generate a contextualized response
5. **Error Handling** — Tool failures are gracefully handled with fallback responses

## User Data Model

User information is stored in MongoDB with the following fields (see `src/models/User.js`):
- `googleId` — Google ID for OAuth identification
- `email` — user email address
- `name` — user display name
- `picture` — user profile picture URL
- `access_token` — encrypted Google OAuth access token
- `refresh_token` — encrypted Google OAuth refresh token
- `expiry_date` — token expiration timestamp
- `github_token` — optional GitHub token for GitHub API integration
- `createdAt` — account creation timestamp
- `updatedAt` — last update timestamp

**Security Note:** All tokens are encrypted using AES-256 cipher before storage (see `src/utils/crypto.js`). Decryption happens automatically when needed.

## Development & Deployment

### Prerequisites
- Node.js v18+ and npm
- MongoDB instance (local or cloud)
- Redis/Upstash account for caching
- Google Cloud project with OAuth credentials
- GROQ API key
- Tavily API key for web search

### Setup Instructions

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the project root with all required variables listed in the Environment Variables section.

3. **Generate Google refresh token:**
```bash
npm run token
```

### Running the Application

**Development mode** (with auto-reload via nodemon):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on port 5000 (or custom `PORT` from `.env`).

### Available Scripts
- `npm run dev` — Start development server with hot reload
- `npm run start` — Start production server
- `npm run token` — Generate/update Google refresh tokens via browser OAuth flow
- `npm run client` — Run the MCP client (if configured)

## Architecture Details

### Component Overview
```
Express Server (Port 5000)
  ├── Routes
  │   ├── /auth (Google OAuth, user management)
  │   └── /chat (AI chat with tool execution)
  ├── Middleware
  │   └── JWT Authentication
  └── Core Services
      ├── ChatHandler (orchestrates AI responses)
      ├── ToolSelection (GROQ-powered tool choosing)
      └── ToolExecutor (executes MCP tools)

MCP Server (Child Process)
  ├── Tools
  │   ├── Calendar
  │   ├── Gmail
  │   ├── GitHub
  │   └── Web Search
  └── Services
      ├── Google APIs
      ├── GitHub API
      └── Tavily Search

Data Layer
  ├── MongoDB (persistent user data)
  └── Redis (conversation caching)
```

### Key Components

**ChatHandler** (`src/ai/chatHandler.js`)
- Orchestrates the complete chat flow
- Manages conversation history in Redis
- Handles GitHub token detection and storage
- Integrates tool selection, execution, and response generation

**ToolSelection** (`src/ai/services/ToolSelection.js`)
- Analyzes user queries using GROQ LLM
- Intelligently selects relevant tools to execute
- Reduces unnecessary API calls
- Improves response quality and context awareness

**ToolExecutor** (`src/ai/toolExecutor.js`)
- Executes selected tools via MCP server
- Handles tool result aggregation
- Manages errors gracefully
- Provides fallback responses on failure

**MCP Server** (`mcp-server/mcpServer.js`)
- Manages tool registration and execution
- Interfaces with external APIs (Google, GitHub, Tavily)
- Runs as a child process (stdio transport)
- Auto-launched by `src/config/mcpClient.js`

## Frontend Integration

### CORS & Origin Configuration
The backend accepts requests from the configured frontend URL:
- Default: `http://localhost:5173` (Vite)
- Configurable via `FRONTEND_URL` environment variable
- Credentials enabled for cookie transmission

### Cookie-Based Authentication
- Auth tokens stored in secure, httpOnly cookies
- Cookies automatically sent with requests (via `credentials: 'include'`)
- Frontend must preserve cookies across requests

### Sample Chat Request
```javascript
const response = await fetch('http://localhost:5000/chat', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'x-session-id': 'your-session-id'
  },
  body: JSON.stringify({
    message: 'What are my upcoming calendar events?'
  })
});

const result = await response.json();
console.log(result); // Contains AI response and tool results
```

## Adding New Tools & Services

### Steps to Add a New Tool:

1. **Create service** in `mcp-server/services/newService.js`:
```javascript
export async function performAction(params) {
  // Your implementation
  return result;
}
```

2. **Create tool wrapper** in `mcp-server/tools/newTools.js`:
```javascript
export const newTools = [
  {
    name: 'action_name',
    description: 'Detailed description for LLM',
    schema: { /* input schema */ },
    handler: performAction
  }
];
```

3. **Register in MCP server** (`mcp-server/mcpServer.js`):
```javascript
import { newTools } from './tools/newTools.js';
const allTools = [...existingTools, ...newTools];
```

4. **Update ToolSelection** prompts if needed for better tool selection.

## Troubleshooting

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| MongoDB connection timeout | Invalid URI or network issue | Check `MONGO_URI` in `.env`, verify network access |
| Redis connection failed | Upstash credentials invalid | Verify `REDIS_URL` and `REDIS_TOKEN` |
| OAuth callback fails | Redirect URI mismatch | Register correct URL in Google Cloud Console |
| MCP tools not executing | Process spawn failure | Check Node permissions, verify `mcpServer.js` syntax |
| Empty tool selection | GROQ API issue | Verify `GROQ_API_KEY`, check API quota and rate limits |
| Google API calls fail | Invalid refresh token | Run `npm run token` to regenerate |
| Token encryption errors | Mismatched encryption keys | Ensure `JWT_SECRET`, `ENCRYPTION_KEY`, and `ENCRYPTION_IV` haven't changed |

### Debug Logging
Enable detailed logging by checking:
- `src/config/mcpClient.js` — MCP connection issues
- `src/ai/chatHandler.js` — Chat flow and Redis operations
- `src/ai/services/ToolSelection.js` — Tool selection logic
- `src/ai/toolExecutor.js` — Tool execution errors

## Performance Optimization

### Redis Caching Strategy
- Conversation history cached for 1 hour per session
- Last 10 messages retained for context
- Reduces database queries and improves response speed

### Tool Execution Pipeline
- Tools execute in parallel when possible
- Results aggregated before response generation
- Timeouts prevent hanging requests

### Database Optimization
- Add indexes on `googleId` and `email` fields
- Use connection pooling for MongoDB
- Monitor query performance regularly

## Security Best Practices

1. **Environment Variables**: Never commit `.env` to version control
2. **Token Encryption**: All user tokens encrypted before storage (AES-256)
3. **HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Implement per-user rate limits for chat endpoint
5. **Secret Management**: Use secure vaults (AWS Secrets Manager, etc.) in production
6. **CORS**: Restrict to specific frontend domains
7. **Token Rotation**: Implement automatic Google token refresh
8. **Input Validation**: Sanitize all user inputs in chat messages

## Deployment Considerations

### Environment-Specific Setup
- Ensure all services (MongoDB, Redis) are accessible
- Use strong, unique passwords for databases
- Configure proper network security groups/firewalls
- Set `NODE_ENV=production` in production environments

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose (with MongoDB & Redis)
See example `docker-compose.yml` for a complete stack setup.

---

**Last Updated:** April 2026  
**Version:** 1.0.0  
**Status:** Production Ready
