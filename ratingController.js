import Rating from "../models/Rating.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// ✅ Submit Rating (One-time only, no editing allowed)
export const submitRating = async (req, res) => {
  try {
    const { productId, rating, comment, earning } = req.body;
    const userId = req.user.id; // From JWT token

    console.log("📝 Rating submission attempt:", { productId, userId, rating, earning });

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ❌ Check if user already rated this product
    const existingRating = await Rating.findOne({ productId, userId });
    if (existingRating) {
      console.log("❌ User already rated this product");
      return res.status(400).json({
        success: false,
        message: "You have already rated this product. Editing is not allowed."
      });
    }

    // Check remaining attempts
    if (user.remaining <= 0) {
      return res.status(403).json({
        success: false,
        message: "No remaining attempts"
      });
    }

    console.log("✅ Creating new rating...");

    // Create new rating
    const newRating = new Rating({
      productId,
      userId,
      rating,
      earning,
      comment: comment || ""
    });

    await newRating.save();
    console.log("✅ Rating saved:", newRating._id);

    // Decrease user's remaining attempts
    user.remaining -= 1;
    user.luckydrawAttempt -= 1;
    user.topgradeAttempt -= 1;

    // ✅ Add earning to user's balance and total earning
    const earnValue = parseFloat(earning) || 0;
    user.balance = (user.balance || 0) + earnValue;
    user.earning = (user.earning || 0) + earnValue;

    // ✅ Activate lucky draw if remaining == luckydrawAttempt
    // if (user.luckydrawAttempt === user.remaining) {
    //   user.luckydrawStatus = "active";
    // }

    await user.save();
    console.log("✅ User updated: balance =", user.balance, "earning =", user.earning, "remaining =", user.remaining);

    // ✅ Update product’s average rating
    const updatedProduct = await updateProductRating(productId);
    console.log("✅ Product rating updated:", {
      avgRating: updatedProduct.rating,
      totalRatings: updatedProduct.ratedCount
    });

    // Add income to admin (product owner)
    if (product.income && product.income > 0) {
      const admin = await User.findOne({ email: product.addedBy });
      if (admin) {
        admin.balance = (admin.balance || 0) + product.income;
        await admin.save();
        console.log("💰 Admin earned:", product.income, "New balance:", admin.balance);
      }
    }

    res.status(201).json({
      success: true,
      message: "✅ Rating submitted successfully",
      rating: newRating,
      remaining: user.remaining,
      updatedBalance: user.balance,
      updatedEarning: user.earning,
      productRating: {
        average: updatedProduct.rating,
        count: updatedProduct.ratedCount
      }
    });
  } catch (err) {
    console.error("❌ Error submitting rating:", err);
    res.status(500).json({
      success: false,
      message: "❌ Error submitting rating",
      error: err.message
    });
  }
};


// ✅ Helper: Update Product Average Rating (SYNCHRONOUS)
async function updateProductRating(productId) {
  console.log("📊 Calculating average rating for product:", productId);

  // Get all ratings for this product
  const ratings = await Rating.find({ productId });
  
  console.log("📊 Found ratings:", ratings.length);

  if (ratings.length === 0) {
    // No ratings yet, reset to 0
    const updated = await Product.findByIdAndUpdate(
      productId, 
      { 
        rating: 0, 
        ratedCount: 0 
      },
      { new: true } // Return updated document
    );
    console.log("📊 No ratings, reset to 0");
    return updated;
  }

  // Calculate average
  // Example: User1 rates 3, User2 rates 5
  // Total = 3 + 5 = 8
  // Average = 8 / 2 = 4.0
  const totalRating = ratings.reduce((sum, r) => {
    console.log("  Adding rating:", r.rating);
    return sum + r.rating;
  }, 0);
  
  const avgRating = totalRating / ratings.length;

  console.log("📊 Calculation:", {
    totalRating,
    count: ratings.length,
    average: avgRating.toFixed(2)
  });

  // Update product with new average and count
  const updated = await Product.findByIdAndUpdate(
    productId, 
    {
      rating: parseFloat(avgRating.toFixed(2)), // Round to 2 decimals
      ratedCount: ratings.length
    },
    { new: true } // Return updated document
  );

  return updated;
}

// ✅ Get All Ratings for a Product
export const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;

    const ratings = await Rating.find({ productId })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    // Calculate average for verification
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    res.json({
      ratings,
      summary: {
        total: ratings.length,
        average: parseFloat(avgRating.toFixed(2))
      }
    });
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ message: "❌ Error fetching ratings" });
  }
};

// ✅ Get User's Ratings
export const getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    const ratings = await Rating.find({ userId })
      .populate("productId", "name imageUrl rating ratedCount")
      .sort({ createdAt: -1 });

    console.log("📋 User ratings fetched:", ratings.length);

    res.json(ratings);
  } catch (err) {
    console.error("Error fetching user ratings:", err);
    res.status(500).json({ message: "❌ Error fetching user ratings" });
  }
};

// ✅ Check if User Rated a Product
export const checkUserRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({ productId, userId });

    if (rating) {
      return res.json({ rated: true, rating });
    }

    res.json({ rated: false });
  } catch (err) {
    console.error("Error checking rating:", err);
    res.status(500).json({ message: "❌ Error checking rating" });
  }
};

// ✅ Delete Rating (Optional - recalculates average after deletion)
export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({ _id: id, userId });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    const productId = rating.productId;

    await rating.deleteOne();
    console.log("🗑️ Rating deleted:", id);

    // Recalculate product rating after deletion
    const updatedProduct = await updateProductRating(productId);
    console.log("📊 Product rating recalculated after deletion");

    res.json({ 
      message: "✅ Rating deleted successfully",
      productRating: {
        average: updatedProduct.rating,
        count: updatedProduct.ratedCount
      }
    });
  } catch (err) {
    console.error("Error deleting rating:", err);
    res.status(500).json({ message: "❌ Error deleting rating" });
  }
};

// ✅ Admin: Get All Ratings (for admin dashboard)
export const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("userId", "fullName email")
      .populate("productId", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    console.error("Error fetching all ratings:", err);
    res.status(500).json({ message: "❌ Error fetching ratings" });
  }
};

// ✅ Get All User Ratings (only rating, createdAt, and earning)
export const getUserEarningsRatings = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT

    const ratings = await Rating.find({ userId })
      .select("rating createdAt earning") // only these fields
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      ratings,
    });
  } catch (err) {
    console.error("❌ Error fetching user's ratings:", err);
    res.status(500).json({
      success: false,
      message: "❌ Error fetching user's ratings",
      error: err.message,
    });
  }
};

