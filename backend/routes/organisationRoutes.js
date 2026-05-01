import express from "express";
import {
  getOrganisations,
  createOrganisation,
  deleteOrganisation,
} from "../controllers/organisationController.js";
import  protect  from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrganisation);
router.get("/", protect, getOrganisations);
router.delete("/:id", protect, deleteOrganisation);

export default router;