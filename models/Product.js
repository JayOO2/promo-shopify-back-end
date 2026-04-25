import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  rating: { type: Number, default: 0 },
  ratedCount: { type: Number, default: 0 },
  addedBy: { type: String, required: true }, // admin email
  createdAt: { type: Date, default: Date.now },
  price: {type: Number},
  income: { type: Number, default: 0 },
  reacts: {type: Number},
  isLuckyOrderProduct: {type: String, default: "no"},
  plan: { 
  type: String, 
  enum: [
    "Starter", 
    "Basic", 
    "Beginner", 
    "Advanced", 
    "Professional", 
    "Premium"
  ], 
  default: "Starter" 
}
});

export default mongoose.model("Product", productSchema);
