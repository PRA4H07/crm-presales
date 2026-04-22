import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: "SYSTEM_ADMIN" });

    if (existingAdmin) {
      console.log("System Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "System Admin",
      email: "admin@crm.com",
      password: hashedPassword,
      role: "SYSTEM_ADMIN",
    });

    console.log("System Admin created:", admin.email);

    process.exit();
  } catch (error) {
    console.error("Seeder error:", error.message);
    process.exit(1);
  }
};

seedAdmin();