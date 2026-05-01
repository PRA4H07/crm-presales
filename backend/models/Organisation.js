import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    plan: {
      type: String,
      enum: ["Trial", "Basic", "Premium", "Enterprise"],
      default: "Trial",
    },

    maxUsers: {
      type: Number,
      default: 10,
    },

    status: {
      type: Boolean,
      default: true,
    },

    dbType: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
    },

    mongoUri: {
      type: String,
      default: "",
    },

    dbName: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organisation", organisationSchema);