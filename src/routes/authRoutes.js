import express from "express";
import { googleLogin, googleCallback } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getMe } from "../controllers/userController.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// 🔥 CURRENT USER
router.get("/me", authMiddleware, getMe);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;