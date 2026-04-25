// routes/payoutRoutes.js
import express from "express";
import { submitPayout, getPayoutHistory, getAllPayouts, updatePayoutStatus } from "../controllers/payoutController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit payout request
router.post("/submit", verifyToken, submitPayout);

// Get payout history
router.get("/history", verifyToken, getPayoutHistory);

// Admin
router.get("/admin/all", verifyToken, getAllPayouts);
router.patch("/admin/:payoutId", verifyToken, updatePayoutStatus);

export default router;