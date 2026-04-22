import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Client from "../models/Client.js";

export const getInsights = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalLeads = await Lead.countDocuments();

    const activeLeads = await Lead.countDocuments({ status: "Active" });

    const users = await User.find();

    const userStats = await Promise.all(
      users.map(async (user) => {
        const leads = await Lead.countDocuments({ createdBy: user._id });

        const active = await Lead.countDocuments({
          createdBy: user._id,
          status: "Active",
        });

        const clients = await Client.countDocuments({
          createdBy: user._id,
        });

        const conversion =
          leads > 0 ? Math.round((clients / leads) * 100) : 0;

        return {
          name: user.name,
          totalLeads: leads,
          activeLeads: active,
          conversion,
        };
      })
    );

    res.json({
      totalUsers,
      totalLeads,
      activeLeads,
      userStats,
    });
  } catch (err) {
    console.log("INSIGHTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};