import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import fundPaymentRoutes from "./routes/fundPaymentRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";

import cron from "node-cron";
import User from "./models/User.js";

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

const app = express();

// Allow both explicitly configured origins and comma-separated FRONTEND_URLS values.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  ...(process.env.FRONTEND_URLS ?? "").split(","),
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn("⚠️ No frontend origins configured. Allowing all origins until FRONTEND_URL is set.");
}


// 👇 Configure CORS for your frontend
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH","PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ Added Authorization
  credentials: true // allow cookies/auth headers
}));

app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use('/api/support', supportRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/fund-payments", fundPaymentRoutes);
app.use("/api/payout", payoutRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Reset ads every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Running daily reset for ad counts...");
  try {
    const users = await User.find();
    for (const user of users) {
      if (user.adsPerDay) {
        user.remaining = user.adsPerDay;
        user.earning = 0;
        await user.save();
      }
    }
    console.log("✅ All users' remaining ads reset successfully!");
  } catch (err) {
    console.error("❌ Error resetting ad counts:", err.message);
  }
});
