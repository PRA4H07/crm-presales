import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getAgency, updateAgency } from "../controllers/agencyController.js";

const router = express.Router();

router.get("/", protect, getAgency);
router.put("/", protect, updateAgency);

export default router;