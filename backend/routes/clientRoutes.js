import express from "express";
import protect from "../middleware/authMiddleware.js";
import { createClient, getClients, getClientById, deleteClient, updateClient, updateClientStatus } from "../controllers/clientController.js";

const router = express.Router();

router.post("/", protect, createClient);
router.get("/", protect, getClients);
router.get("/:id", protect, getClientById);
router.put("/:id", protect, updateClient);
router.delete("/:id", protect, deleteClient);
router.put("/:id/status", protect, updateClientStatus);

export default router;