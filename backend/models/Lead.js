import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    phone: {
      type: String,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Booked"],
      default: "New",
    },

    source: {
      type: String,
      enum: ["Website", "Referral", "Cold Call"],
      default: "Website",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    budget: {
      type: Number,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Lead", leadSchema);