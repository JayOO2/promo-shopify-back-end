import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    default: "" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  earning: {
    type: Number,
  }
});

// Ensure one user can only rate a product once
ratingSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);