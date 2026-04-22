import express from "express";
import { getInsights } from "../controllers/insightsController.js";

const router = express.Router();

router.get("/", getInsights);

export default router;