// models/Payout.js
import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, "Amount must be greater than 0"],
  },
  method: {
    type: String,
    enum: ["usdt", "bank"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "rejected"],
    default: "pending",
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Stores USDT or Bank info
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
});

export default mongoose.model("Payout", payoutSchema);