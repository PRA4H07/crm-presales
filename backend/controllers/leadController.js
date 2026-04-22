import Lead from "../models/Lead.js";
import Client from "../models/Client.js";

export const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      status,
      source,
      priority,
      budget,
    } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      status,
      source,
      priority,
      budget,
      createdBy: req.user._id,
    });

    res.status(201).json(lead);
  } catch (error) {
    console.log("CREATE LEAD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await lead.deleteOne();

    res.json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSingleLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    console.log("GET SINGLE LEAD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    Object.assign(lead, req.body);

    await lead.save();

    res.json(lead);
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.status = status;

    await lead.save();

    res.json(lead);
  } catch (error) {
    console.log("STATUS UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const convertLeadToClient = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const client = await Client.create({
      name: lead.name || "Unnamed",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "—",
      status: "Active",

      createdBy: req.user?._id || null,
    });

    await lead.deleteOne();

    res.json({ message: "Converted successfully", client });
  } catch (error) {
    console.log("CONVERT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};