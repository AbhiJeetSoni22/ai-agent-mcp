import express from "express";
import { handleChat } from "../ai/chatHandler.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const message = req.body.message
 const sessionId = req.headers["x-session-id"] || "default";
const reply = await handleChat(message, sessionId);

    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
