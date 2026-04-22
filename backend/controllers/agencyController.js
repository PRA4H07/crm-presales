import Agency from "../models/Agency.js";

export const getAgency = async (req, res) => {
  try {
    const agency = await Agency.findOne();

    if (!agency) {
      return res.json({});
    }

    res.json(agency);
  } catch (error) {
    console.log("GET AGENCY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAgency = async (req, res) => {
  try {
    const { organizationName, organizationCode, organizationAddress, maximumUsers } = req.body;

    let agency = await Agency.findOne();

    if (!agency) {
      agency = await Agency.create({
        organizationName,
        organizationCode,
        organizationAddress,
        maximumUsers,
      });
    } else {
      agency.organizationName = organizationName;
      agency.organizationCode = organizationCode;
      agency.organizationAddress = organizationAddress;
      agency.maximumUsers = maximumUsers;

      await agency.save();
    }

    res.json(agency);
  } catch (error) {
    console.log("UPDATE AGENCY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};