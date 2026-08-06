import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import projectRoutes from "./routes/project.routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio API Running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});