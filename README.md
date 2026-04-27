# 🚀 AI Agent — MCP Backend

A Node.js backend for an AI assistant platform using **MCP**, **GROQ**, and **LangChain**.

This repository powers a hybrid AI system with:

* ⚡ GPT-style chat + tool execution
* 🔎 intelligent web research
* 🔐 Google OAuth login + JWT sessions
* 💾 MongoDB user storage + Redis chat memory
* 🌐 frontend-ready API endpoints

---

# 🔥 Key Features

* Google OAuth authentication with JWT cookies
* Tool selection via GROQ and MCP
* MCP tool execution for web / GitHub / calendar / Gmail workflows
* Deep research powered by LangChain and Tavily search
* Redis-based conversation memory per session
* MongoDB user profile persistence
* GitHub token capture and secure storage

---

# 📁 Current Project Structure

```text
src/
├── agent/
│   ├── deepSearchAgent.js
│   ├── langchainAgent.js
│   └── langchainTools.js
├── ai/
│   ├── chatHandler.js
│   ├── prompts.js
│   └── toolExecutor.js
├── config/
│   ├── db.js
│   ├── googleClient.js
│   ├── googleOAuth.js
│   ├── groqClient.js
│   ├── mcpClient.js
│   ├── redisClient.js
│   └── ToolSelection.js
├── controllers/
│   ├── authController.js
│   ├── deepSearchController.js
│   └── userController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── chat.route.js
│   └── deepSearchRoutes.js
├── services/
│   ├── calendarService.js
│   ├── deepSearchService.js
│   ├── githubService.js
│   ├── gmailService.js
│   ├── googleService.js
│   └── userService.js
├── utils/
│   └── crypto.js
└── server.js
```

---

# 🧠 Architecture

## Chat Agent (MCP-based)

* Uses `groq.chat.completions.create`
* Runs on `llama-3.3-70b-versatile`
* Selects relevant tools via `ToolSelection.js`
* Executes MCP function calls through `mcp-server`
* Stores recent conversation history in Redis

## Deep Search Agent (LangChain-powered)

* Uses `@langchain/core` + `@langchain/groq`
* Runs a research agent over Tavily search results
* Scrapes web pages with Cheerio
* Returns structured answers with source links

---

# 🔁 System Flow

## Chat Flow

1. User sends a message to `POST /chat`
2. Request is authenticated via JWT cookie
3. Tools are selected with GROQ
4. MCP tool calls execute against available tool definitions
5. Final answer is generated and returned

## Deep Search Flow

1. User sends search query to `POST /deep-search`
2. LangChain agent uses `search_web` and `scrape_webpage`
3. Tavily returns web search results
4. Scraper extracts page text
5. Agent summarizes findings with sources

---

# 🌐 API Endpoints

## Authentication

* `GET /auth/google` — start Google OAuth
* `GET /auth/google/callback` — OAuth callback
* `GET /auth/me` — get current user
* `GET /auth/logout` — clear cookie and logout

## Chat

* `POST /chat` — protected chat endpoint
  * Request body: `{ "message": "..." }`
  * Requires `x-session-id`

## Deep Search

* `POST /deep-search` — public research query endpoint
  * Request body: `{ "query": "..." }`

---

# 📦 Environment Variables

Required variables for local setup:

* `GROQ_API_KEY`
* `MONGO_URI`
* `REDIS_URL`
* `REDIS_TOKEN`
* `GOOGLE_CLIENT_ID`
* `GOOGLE_CLIENT_SECRET`
* `JWT_SECRET`
* `FRONTEND_URL`
* `TAVILY_API_KEY`

---

# 🚀 Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with required variables.

3. Start the server:

```bash
npm run dev
```

4. Backend will be available at `http://localhost:5000`

---

# 🔧 Notes

* `src/server.js` enables CORS for `http://localhost:5173`
* `src/config/mcpClient.js` starts the local MCP server at `mcp-server/mcpServer.js`
* `src/ai/chatHandler.js` saves up to 10 recent messages per session in Redis
* GitHub tokens in chat messages are detected and saved via `ghp_...`

---

# 📌 Current Status

✅ Backend API routes implemented
✅ Google OAuth login flow
✅ Chat + MCP tool orchestration
✅ Deep search agent with web search and scraping

---

# Version

`1.0.0`


* MongoDB → user data
* Redis → chat memory
* Encrypted tokens (AES-256)

---

# 🚀 Performance

| Feature                 | Speed                     |
| ----------------------- | ------------------------- |
| Chat (GROQ)             | ⚡ Fast                    |
| Deep Search (LangChain) | 🧠 Slower but intelligent |

---

# 🔐 Security

* JWT authentication
* Encrypted tokens
* HTTP-only cookies
* No credential exposure to LLM

---

# 🚀 Future Improvements

* Redis caching for deep search
* Parallel scraping
* Source ranking system
* LangGraph multi-agent system
* Streaming responses

---

# 🎯 Final Goal

A **Hybrid AI Agent System** that provides:

* ⚡ Fast assistant (chat)
* 🧠 Intelligent research agent (deep search)

---

# 📌 Status

✅ MCP architecture stable
✅ Multi-user system working
✅ LangChain deep search implemented
✅ Frontend integrated
🚀 System ready for advanced scaling

---

**Last Updated:** April 2026
**Version:** 2.1.0
**Architecture:** Hybrid AI Agent System 🚀
