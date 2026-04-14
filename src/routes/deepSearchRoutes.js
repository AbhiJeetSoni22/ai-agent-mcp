import express from "express";
import { deepSearchController } from "../deepsearch/controller/deepSearchController.js";

const router = express.Router();

// POST /deep-search
router.post("/", deepSearchController);

export default router;