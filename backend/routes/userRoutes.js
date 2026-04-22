import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { createUser, getUsers } from "../controllers/userController.js";
import { deleteUser } from "../controllers/userController.js";
import { updateUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/", protect, authorize("SYSTEM_ADMIN", "ADMIN"), createUser);

router.get("/", protect, authorize("SYSTEM_ADMIN", "ADMIN"), getUsers);

router.get("/admin-only", protect, authorize("SYSTEM_ADMIN"), (req, res) => {
  res.json({ message: "Welcome System Admin!" });
});

router.delete("/:id", protect, authorize("SYSTEM_ADMIN", "ADMIN"), deleteUser);

router.put("/:id", protect, authorize("SYSTEM_ADMIN", "ADMIN"), updateUser);

export default router;