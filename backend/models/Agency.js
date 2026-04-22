import mongoose from "mongoose";

const agencySchema = new mongoose.Schema({
  organizationName: String,
  organizationCode: String,
  organizationAddress: String,
  maximumUsers: Number,
}, { timestamps: true });

export default mongoose.model("Agency", agencySchema);