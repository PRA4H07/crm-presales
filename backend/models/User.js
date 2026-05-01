import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["SYSTEM_ADMIN", "ADMIN", "EMPLOYEE"],
      required: true,
    },

    orgRole: {
      type: String,
      enum: ["ADMIN", "MANAGE", "READ_ONLY"],
      default: "READ_ONLY",
    },

    designation: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
