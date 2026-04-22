import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import agencyRoutes from "./routes/agencyRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/agency", agencyRoutes);
app.use("/api/insights", insightsRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;