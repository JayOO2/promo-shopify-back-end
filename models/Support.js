import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    message: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    imageUrl: { type: String },
  },
  { _id: true }
);

const supportSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    useremail: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true }, // initial message
    imageUrl: { type: String },
    adminSeen: {type: Boolean},
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    createdAt: { type: Date, default: Date.now },
    replies: { type: [replySchema], default: [] },
  },
  { versionKey: false }
);

const Support = mongoose.model("Support", supportSchema);
export default Support;
