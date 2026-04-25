import express from "express";
import { 
  submitRating, 
  getProductRatings, 
  getUserRatings, 
  checkUserRating,
  deleteRating,
  getAllRatings,
  getUserEarningsRatings 
} from "../controllers/ratingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit or update rating (requires authentication)
router.post("/submit", verifyToken, submitRating);

// Get all ratings for a product
router.get("/product/:productId", getProductRatings);

// Get user's ratings
router.get("/user", verifyToken, getUserRatings);

// Check if user rated a product
router.get("/check/:productId", verifyToken, checkUserRating);

// Delete rating
router.delete("/:id", verifyToken, deleteRating);

// ✅ Admin: Get all ratings
router.get("/all", verifyToken, getAllRatings);

router.get("/user/earnings", verifyToken, getUserEarningsRatings)

export default router;