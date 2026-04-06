import express from "express";
import { googleLogin, googleCallback } from "../controllers/authController.js";
import { verifyUser } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);


router.get("/me", verifyUser, (req, res) => {
  res.json({ user: req.user });
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});
export default router;