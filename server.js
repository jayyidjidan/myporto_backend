import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import projectRoutes from "./routes/project.routes.js";

dotenv.config();

connectDB();

const app = express();

// Bisa lebih dari satu origin, pisahkan dengan koma di .env
// contoh: CLIENT_URL=http://localhost:5173,https://domainkamu.com
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin tidak diizinkan: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio API Running 🚀",
  });
});

// 404 dalam bentuk JSON (harus setelah semua route)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler terakhir, selalu JSON
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});