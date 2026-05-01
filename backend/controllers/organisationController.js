import Organisation from "../models/Organisation.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/email.js";

export const createOrganisation = async (req, res) => {
  try {
    const {
      name,
      email,
      plan,
      maxUsers,
      dbType,
      mongoUri,
      dbName,
      adminName,
      adminEmail,
      role,
    } = req.body;

    if (req.user.role !== "SYSTEM_ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!name || !email || !adminName || !adminEmail) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const organisation = await Organisation.create({
      name,
      email,
      plan,
      maxUsers,
      dbType: dbType || "internal",
      mongoUri: mongoUri || "",
      dbName: dbName || "",
      createdBy: req.user._id,
    });

    const tempPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      orgRole: role || "ADMIN",
      organisationId: organisation._id,
      createdBy: req.user._id,
      mustChangePassword: true,
    });

    await sendEmail(adminEmail, tempPassword);

    res.status(201).json({
      message: "Organisation and Admin created successfully",
      organisation,
      adminUser,
    });
  } catch (error) {
    console.error("Create Organisation Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getOrganisations = async (req, res) => {
  try {
    const organisations = await Organisation.find().sort({ createdAt: -1 });

    res.json(organisations);
  } catch (error) {
    console.error("Fetch Organisations Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteOrganisation = async (req, res) => {
  try {
    if (req.user.role !== "SYSTEM_ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { id } = req.params;
    const organisation = await Organisation.findById(id);

    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    await User.deleteMany({ organisationId: organisation._id });
    await Organisation.deleteOne({ _id: organisation._id });

    return res.json({ message: "Organisation deleted successfully" });
  } catch (error) {
    console.error("Delete Organisation Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
