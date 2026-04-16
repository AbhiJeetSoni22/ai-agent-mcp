import express from "express";
import { handleChat } from "../ai/chatHandler.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const message = req.body.message;
    const sessionId = req.headers["x-session-id"] || "default";
    const userId = req.user.userId; // 🔥 IMPORTANT
  
    const result = await handleChat(message, sessionId, userId);

    res.json(result);
  } catch (e) {
    console.error("CHAT ROUTE ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;