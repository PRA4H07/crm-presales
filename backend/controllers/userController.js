import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/email.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, role, designation, organisationId, status, orgRole } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const randomPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      orgRole: orgRole || "READ_ONLY",
      designation,
      organisationId,
      status: status || "Active",
      mustChangePassword: true,
      createdBy: req.user._id,
    });

    try {
      await sendEmail(email, randomPassword);
    } catch (err) {
      console.log("EMAIL ERROR:", err.message);
    }

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role, organisationId } = req.query;

let filter = {};

if (role) filter.role = role;
if (organisationId) filter.organisationId = organisationId;

    const users = await User.find(filter)
  .populate("organisationId", "name email")
  .select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, designation, status, orgRole } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (designation) user.designation = designation;
    if (status !== undefined) user.status = status;
    if (orgRole) user.orgRole = orgRole;

    await user.save();

    res.json({ message: "User updated", user });
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
