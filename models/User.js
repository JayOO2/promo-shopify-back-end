// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  role: { type: String },
  status: { type: String },
  phone: { type: String },
  referrals: { type: String },
  adsPerDay: { type: Number },
  remaining: { type: Number },
  referrelBy: { type: String },
  luckydrawStatus: { type: String, default: "inactive" },
  luckydrawAttempt: { type: Number, default: -1 },
  luckyOrderPrice: { type: Number },
  topgradeAttempt: { type: Number, default: -1 },
  balance: { type: Number },
  earning: { type: Number },
  plan: { type: String, default: "none" },
  luckyOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  tempId: { type: Number, unique: true }, // 👈 make unique
  topgradeStatus: {type: String, default: "inactive"},
  promoCode: { type: String },
});

// 👇 Generate a unique tempId before saving
// userSchema.pre("save", async function (next) {
//   if (!this.tempId) {
//     let unique = false;
//     let newId;

//     while (!unique) {
//       newId = Math.floor(100000 + Math.random() * 900000); // random 6-digit number
//       const exists = await mongoose.models.User.findOne({ tempId: newId });
//       if (!exists) unique = true;
//     }

//     this.tempId = newId;
//   }
//   next();
// });

export default mongoose.model("User", userSchema);
