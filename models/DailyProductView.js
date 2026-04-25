import mongoose from "mongoose";

const dailyProductViewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // e.g., "2025-11-07"
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
});

dailyProductViewSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyProductView", dailyProductViewSchema);
