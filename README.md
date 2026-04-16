# 🚀 AI Agent — MCP Backend (Hybrid AI System)

An intelligent **multi-user AI Agent system** built using **MCP (Model Context Protocol)** and **LangChain**, combining:

* ⚡ Fast tool execution (GROQ + MCP)
* 🧠 Deep research capabilities (LangChain + Gemini)
* 🌐 Full-stack integration (Backend + Frontend)

---

# 🔥 Key Features

* 🔐 Google OAuth Authentication (JWT-based sessions)
* 🧠 Intelligent Tool Selection (GROQ-powered)
* 📅 Multi-service integration (Calendar, Gmail, GitHub)
* 💾 Redis-based chat memory
* 🔗 MCP server for tool execution
* 🔎 **Deep Search Engine (LangChain-based)**
* 🤖 **Hybrid AI Architecture**
* 🌐 **Frontend integration (Chat + Deep Search UI)**

---

# 🧠 Hybrid AI Architecture

This system uses **two AI pipelines**:

---

## ⚡ 1. Chat Agent (MCP-based)

* Model: GROQ (LLaMA 3.3)
* Purpose: Fast responses + tool execution
* Handles:

  * GitHub
  * Calendar
  * Gmail
  * Basic queries

---

## 🔎 2. Deep Search Agent (LangChain-based)

* Model: Gemini (recommended for reasoning)
* Purpose: Real-time research & analysis
* Tools:

  * Tavily (search)
  * ScrapeGraphAI (content extraction)

---

# 📁 Updated Project Structure

```text
src/
│
├── ai/
│   ├── chatHandler.js
│   ├── toolExecutor.js
│   ├── prompts.js
│   └── services/ToolSelection.js
│
├── deepsearch/
│   ├── controller/
│   │   └── deepSearchController.js
│   │
│   ├── service/
│   │   └── deepSearchService.js
│   │
│   ├── agent/
│   │   ├── deepSearchAgent.js
│   │   └── langchainAgent.js
│   │
│   ├── tools/
│   │   ├── tavilyTool.js
│   │   └── scraperTool.js
│   │
│   └── prompts/
│       └── deepSearchPrompt.js
│
├── config/
├── controllers/
├── services/
├── models/
├── utils/
```

---

# 🔁 System Flow

## 🧠 Chat Flow

```
User Query
   ↓
Tool Selection (GROQ)
   ↓
MCP Tool Execution
   ↓
Final Response
```

---

## 🔎 Deep Search Flow

```
User Query
   ↓
LangChain Agent (Gemini)
   ↓
Tavily Search
   ↓
Top URLs
   ↓
ScrapeGraphAI
   ↓
Content Extraction
   ↓
Gemini Reasoning
   ↓
Final Answer + Sources
```

---

# 🌐 API Endpoints

## Chat

```http
POST /chat
```

## 🔎 Deep Search

```http
POST /deep-search
```

### Request:

```json
{
  "query": "latest AI trends"
}
```

### Response:

```json
{
  "summary": "...",
  "sources": ["url1", "url2"]
}
```

---

# 🔎 Deep Search Engine (Implemented)

### Features:

* Real-time web search (Tavily)
* AI-powered scraping (ScrapeGraphAI)
* Multi-source aggregation
* Intelligent summarization (Gemini)
* Source attribution

---

### Pipeline:

```
Search → Extract → Summarize
```

---

# 🤖 Agent Design

## Chat Agent

* Deterministic
* Tool-based (MCP)
* Fast execution

## Deep Search Agent

* Reasoning-based
* Multi-step execution
* LangChain powered

---

# 🌐 Frontend Integration

The system includes a frontend UI that supports:

* Chat interface (real-time AI responses)
* Deep Search interface (research queries)
* Session-based conversation tracking
* Secure authentication (cookies)

---

# ⚠️ Deep Search Constraints

* Max 3–5 search results
* Max 2–3 pages scraped
* Token usage optimized
* Always returns sources

---

# 💾 Data Layer

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
