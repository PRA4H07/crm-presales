import express from "express";
import protect from "../middleware/authMiddleware.js";
import { createLead, getLeads, deleteLead, updateLead, getSingleLead, convertLeadToClient } from "../controllers/leadController.js";
import { updateLeadStatus } from "../controllers/leadController.js";

const router = express.Router();

router.post("/", protect, createLead);
router.get("/", protect, getLeads);
router.get("/:id", protect, getSingleLead);
router.put("/:id", protect, updateLead);
router.put("/:id/status", protect, updateLeadStatus);
router.delete("/:id", protect, deleteLead);
router.post("/:id/convert", protect, convertLeadToClient);

export default router;