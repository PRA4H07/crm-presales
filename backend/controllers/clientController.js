import Client from "../models/Client.js";

export const createClient = async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json(client);
  } catch (err) {
    console.log("CREATE CLIENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("createdBy", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    await client.deleteOne();

    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate("createdBy", "name email")

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json(client)
  } catch (error) {
    console.log("GET CLIENT ERROR:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json(updatedClient)
  } catch (error) {
    console.log("UPDATE CLIENT ERROR:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const updateClientStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const client = await Client.findById(req.params.id).populate("createdBy", "name");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.status = status;
    await client.save();

    res.json(client);
  } catch (error) {
    console.log("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};