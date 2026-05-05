import Organisation from "../models/Organisation.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/email.js";

const CODE_DIGITS = 4;
const CODE_MAX_ATTEMPTS = 25;

function buildCodePrefix(name = "") {
  const sanitized = String(name).replace(/[^a-zA-Z]/g, "").toUpperCase();
  const prefix = sanitized.slice(0, 3);
  return (prefix || "ORG").padEnd(3, "X");
}

function randomDigits(length) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

async function generateUniqueOrganisationCode(name) {
  const prefix = buildCodePrefix(name);

  for (let attempt = 0; attempt < CODE_MAX_ATTEMPTS; attempt += 1) {
    const candidate = `${prefix}-${randomDigits(CODE_DIGITS)}`;
    const exists = await Organisation.exists({ code: candidate });
    if (!exists) return candidate;
  }

  // Final deterministic-ish fallback reduces collision likelihood further.
  const fallbackCandidate = `${prefix}-${Date.now().toString().slice(-CODE_DIGITS)}`;
  const fallbackExists = await Organisation.exists({ code: fallbackCandidate });
  if (!fallbackExists) return fallbackCandidate;

  throw new Error("Unable to generate unique organisation code");
}

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

    const organisationCode = await generateUniqueOrganisationCode(name);

    const organisation = await Organisation.create({
      name,
      email,
      plan,
      maxUsers,
      dbType: dbType || "internal",
      mongoUri: mongoUri || "",
      dbName: dbName || "",
      createdBy: req.user._id,
      code: organisationCode,
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

    for (const organisation of organisations) {
      if (!organisation.code) {
        organisation.code = await generateUniqueOrganisationCode(organisation.name);
        await organisation.save();
      }
    }

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

export const updateOrganisation = async (req, res) => {
  try {
    const { name, city, address, maxUsers } = req.body;

    const organisation = await Organisation.findById(req.params.id);

    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    if (name) organisation.name = name;
    if (city !== undefined) organisation.city = city;
    if (address !== undefined) organisation.address = address;
    if (maxUsers !== undefined) organisation.maxUsers = maxUsers;

    await organisation.save();

    res.json({ message: "Organisation updated", organisation });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
