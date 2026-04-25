import mongoose from "mongoose";

const fundPaymentSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["USDT-TRC20", "Bank", "Card", "Other"],
      required: true,
    },
    imgUrl: {
      type: String, // Cloudinary proof URL
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: {
      type: Date,
    },
    remarks: {
      type: String, // Optional admin note or rejection reason
      default: "",
    },
    transactionId: {
      type: String, // Optional — helps reference or verify transactions
      default: "",
    },
    note: {
        type: String,
        default: "",
    },
    branchName: {
      type: String,
    }
  },
  { timestamps: true }
);

export default mongoose.model("FundPayment", fundPaymentSchema);
