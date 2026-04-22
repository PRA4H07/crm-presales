import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: String,
    phone: String,

    company: String,

    status: {
      type: String,
      enum: ["New", "Active", "Engaged", "Retained", "Churned"],
      default: "New",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Client", clientSchema);
