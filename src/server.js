import express from "express";
import cors from "cors";
import chatRoute from "./routes/chat.route.js";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-session-id"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
connectDB();
app.use("/auth", authRoutes);
app.use("/chat", chatRoute);

app.listen(5000, () =>
  console.log("🚀 Backend running at http://localhost:5000")
);
