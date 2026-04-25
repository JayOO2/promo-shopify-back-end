import Product from "../models/Product.js";
import Rating from "../models/Rating.js";
import DailyProductView from "../models/DailyProductView.js";
import User from "../models/User.js";

// ✅ Create product
export const addProduct = async (req, res) => {
  try {
    console.log("Received body:", req.body);       // Check text fields
    console.log("Received file:", req.file);   

    const { name, description, rating, ratedCount, addedBy, now, income, plan, isLuckyOrderProduct } = req.body;

    if (!name || !addedBy) {
      return res.status(400).json({ message: "Name and addedBy are required" });
    }

    // ✅ Use Cloudinary URL if uploaded, else default to empty string
    const imageUrl = req.file?.path || "";

    const product = new Product({
      name,
      description,
      imageUrl,          // <- always defined
      rating: rating || 0,
      ratedCount: ratedCount || 0,
      addedBy,
      createdAt: now || new Date(),
      income,
      plan,
      isLuckyOrderProduct
    });

    await product.save();
    res.status(201).json({ message: "✅ Product added successfully", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "❌ Error adding product", error: err.message });
  }
};


// ✅ Get all products
// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 });
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "❌ Error fetching products", error: err.message });
//   }
// };
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit
    const type = req.query.type

    const filter = {}
    if (type === "lucky") filter.isLuckyOrderProduct = "yes"
    if (type === "normal") filter.isLuckyOrderProduct = "no"

    const total = await Product.countDocuments(filter)
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      products,
      hasMore: skip + products.length < total,
      currentPage: page,
      total
    })
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" })
  }
}

// ✅ Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating product:", id);
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    // Prepare updates object
    const updates = { ...req.body };

    // If new image uploaded, use its URL
    if (req.file) {
      console.log("new picture updated")
      updates.imageUrl = req.file.path;  // Cloudinary URL
    }

    const updated = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "✅ Product updated successfully", product: updated });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "❌ Error updating product", error: err.message });
  }
};


// ✅ Delete product
export const deleteProduct = async (req, res) => {
  console.log("delete runned")
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "✅ Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting product", error: err.message });
  }
};


// 30 ads per day to customer
// export const getUnratedProducts = async (req, res) => {
//   console.log("runed get unrader prodcut")
//   try {
//     const userId = req.user.id;
//     const today = new Date().toISOString().split("T")[0];

//     // Fetch the logged-in user's plan
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const userPlan = user.plan;

//     // Check if today's set already exists
//     let dailyView = await DailyProductView.findOne({ userId, date: today });

//     if (dailyView) {
//       // Already generated today → fetch same products
//       const products = await Product.find({
//         _id: { $in: dailyView.productIds },
//         plan: userPlan,
//         isLuckyOrderProduct: "no"   // ✅ only "no"
//       });

//       console.log("unrated products :", products)
//       return res.status(200).json(products);
//     }

//     // Otherwise, generate new 30 unrated products (same plan only)
//     const ratedProductIds = await Rating.find({ userId }).distinct("productId");

//     const unratedProducts = await Product.aggregate([
//       {
//         $match: {
//           _id: { $nin: ratedProductIds },
//           plan: userPlan,
//           isLuckyOrderProduct: "no"  // ✅ only "no"
//         },
//       },
//       { $sample: { size: 30 } },
//     ]);

//     // Save this set for today
//     const productIds = unratedProducts.map((p) => p._id);
//     await DailyProductView.create({ userId, date: today, productIds });

//     res.status(200).json(unratedProducts);
//   } catch (error) {
//     console.error("Error fetching daily unrated products:", error);
//     res.status(500).json({ message: "Failed to fetch products" });
//   }
// };

// export const getUnratedProducts = async (req, res) => {
//   console.log("🟢 getUnratedProducts started");

//   try {
//     const userId = req.user.id;
//     console.log("User ID:", userId);

//     // Fetch the logged-in user's plan
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log("❌ User not found");
//       return res.status(404).json({ message: "User not found" });
//     }
//     const userPlan = user.plan;
//     console.log("User plan:", userPlan);

//     // Fetch 30 random products for the user's plan, only where isLuckyOrderProduct is "no"
//     const products = await Product.aggregate([
//       { $match: { plan: userPlan, isLuckyOrderProduct: "no" } },
//       { $sample: { size: 30 } },
//     ]);

//     console.log("Products fetched (no lucky order):", products.length, products);

//     res.status(200).json(products);
//   } catch (error) {
//     console.error("❌ Error fetching products:", error);
//     res.status(500).json({ message: "Failed to fetch products" });
//   }
// };


export const getUnratedProducts = async (req, res) => {
  console.log("🟢 getUnratedProducts started");

  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    console.log("User ID:", userId);
    console.log("Today's date:", today);

    // ✅ Fetch logged-in user
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const userPlan = user.plan;
    console.log("User plan:", userPlan);

    // If plan is "none" → just return 30 random products (ignores daily tracking)
    if (!userPlan || userPlan === "none") {
      const products = await Product.aggregate([
        { $match: { isLuckyOrderProduct: "no" } },
        { $sample: { size: 30 } },
      ]);
      console.log("Plan is none → returning 30 random products:", products.length);
      return res.status(200).json(products);
    }

    // ✅ Check if today's product set already exists
    let dailyView = await DailyProductView.findOne({ userId, date: today });

    if (dailyView) {
      const products = await Product.find({
        _id: { $in: dailyView.productIds },
        plan: userPlan,
        isLuckyOrderProduct: "no"
      });

      if (products.length > 0) {
        console.log("✅ Found today's product set, returning same 30 products");
        return res.status(200).json(products);
      } else {
        console.log("⚠️ Today's product set empty or invalid — regenerating new 30 products");
        await DailyProductView.deleteOne({ _id: dailyView._id }); // remove bad record
      }
    }

    // ✅ No record for today → generate new 30 products
    const ratedProductIds = await Rating.find({ userId }).distinct("productId");
    console.log("Rated Product IDs:", ratedProductIds);

    const testCount = await Product.countDocuments({
      plan: userPlan,
      isLuckyOrderProduct: "no",
      _id: { $nin: ratedProductIds }
    });
    console.log("🧩 Matching products available for this plan:", testCount);

    const unratedProducts = await Product.aggregate([
      {
        $match: {
          _id: { $nin: ratedProductIds },
          plan: userPlan,
          isLuckyOrderProduct: "no"
        }
      },
      { $sample: { size: 30 } }
    ]);

    console.log("🧩 Unrated products fetched:", unratedProducts.length);

    // ✅ Save this new set
    const productIds = unratedProducts.map((p) => p._id);
    await DailyProductView.create({ userId, date: today, productIds });

    console.log(`Generated new set of ${unratedProducts.length} products for today`);
    return res.status(200).json(unratedProducts);

  } catch (error) {
    console.error("❌ Error fetching daily unrated products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};






// ✅ Get all Lucky Order Products
export const getLuckyOrderProducts = async (req, res) => {
  try {
    const products = await Product.find({ isLuckyOrderProduct: "yes" });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching lucky order products:", error);
    res.status(500).json({ message: "Failed to fetch lucky order products" });
  }
};

// ✅ Get orders by product ID
// ✅ Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) return res.status(400).json({ message: "Product ID is required" });

    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ product }); // return product directly
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};
