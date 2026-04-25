import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  createFundPayment,
  getAllFundPayments,
  getUserFundPayments,
  updateFundPaymentStatus
} from "../controllers/fundPaymentController.js";

const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fund_payments",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"], // allow PDFs too
  },
});

const parser = multer({ storage });

// Customer creates a fund payment request
router.post("/add", parser.single("imgUrl"), createFundPayment);

// Admin fetch all fund payments
router.get("/", getAllFundPayments);

// Get payments for a specific user
router.get("/user/:userID", getUserFundPayments);

// Approve or reject a payment
router.patch("/update/:id", updateFundPaymentStatus);

// Get request based onn user ID
router.get("/:userID", getUserFundPayments);

export default router;
