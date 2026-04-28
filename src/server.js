import express from "express";
import cors from "cors";
import chatRoute from "./routes/chat.route.js";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import deepSearchRoutes from "./routes/deepSearchRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
connectDB();
app.use("/auth", authRoutes);
app.use("/chat", chatRoute);
app.use("/deep-search", deepSearchRoutes);

app.listen(5000, () =>
  console.log("🚀 Backend running at http://localhost:5000")
);
