import express from "express";
import { deepSearchController } from "../controllers/deepSearchController.js"
const router = express.Router();

// POST /deep-search
router.post("/", deepSearchController);

export default router;