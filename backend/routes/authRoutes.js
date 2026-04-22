import express from "express";
import { loginUser, changePassword } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";  // 🔥 ADD THIS

const router = express.Router();

router.post("/login", loginUser);

router.put("/change-password", protect, changePassword);

export default router;