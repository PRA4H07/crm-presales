import express from "express";
import {
  getOrganisations,
  createOrganisation,
  deleteOrganisation,
  updateOrganisation,
} from "../controllers/organisationController.js";
import  protect  from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrganisation);
router.get("/", protect, getOrganisations);
router.delete("/:id", protect, deleteOrganisation);
router.put("/:id", protect, updateOrganisation);

export default router;