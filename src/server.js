import express from "express";
import cors from "cors";
import chatRoute from "./routes/chat.route.js";
import "dotenv/config";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoute);

app.listen(5000, () =>
  console.log("🚀 Backend running at http://localhost:5000")
);
