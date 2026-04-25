// controllers/payoutController.js
import User from "../models/User.js";
import Payout from "../models/Payout.js";

// Submit Payout Request
export const submitPayout = async (req, res) => {
  try {
    const { amount, method, usdtName, usdtAddress, bankAccountNumber, bankAccountHolder, bankName, bankBranch } = req.body;
    const userId = req.user.id; // from verifyToken middleware

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < parsedAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Prepare payout details
    const payoutDetails = method === "usdt"
      ? { usdtName, usdtAddress, currency: "USDT" }
      : { bankAccountNumber, bankAccountHolder, bankName, bankBranch, currency: "LKR" };

    // Create payout record
    const payout = await Payout.create({
      userId,
      amount: parsedAmount,
      method,
      details: payoutDetails,
    });

    res.status(200).json({
      success: true,
      message: `Payout of $${parsedAmount.toFixed(2)} submitted successfully!`,
      payout,
    });
  } catch (error) {
    console.error("Payout Error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

// Get User's Payout History (Optional)
export const getPayoutHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const payouts = await Payout.find({ userId }).sort({ requestedAt: -1 });
    res.status(200).json(payouts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payout history" });
  }
};

export const updatePayoutStatus = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    if (!["completed", "rejected"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const payout = await Payout.findById(payoutId);
    if (!payout) return res.status(404).json({ error: "Payout not found" });
    if (payout.status !== "pending")
      return res.status(400).json({ error: "Already processed" });

    // Only deduct balance if approving payout
    if (status === "completed") {
      const user = await User.findById(payout.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (user.balance < payout.amount) {
        return res.status(400).json({ error: "User has insufficient balance for payout" });
      }

      user.balance -= payout.amount;
      await user.save();
    }

    payout.status = status;
    payout.processedAt = new Date();
    payout.processedBy = adminId;
    await payout.save();

    res.json({ success: true, message: `Payout ${status}!`, payout });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


// controllers/payoutController.js
export const getAllPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({})
      .populate({
        path: "userId",
        select: "tempId fullName email username", // ← include tempId
      })
      .lean();

    const result = payouts.map(p => ({
      ...p,
      tempId: p.userId?.tempId ?? null,
      userId: p.userId?._id?.toString(),
      fullName: p.userId?.fullName ?? "",
      email: p.userId?.email ?? "",
      username: p.userId?.username ?? "",
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payouts" });
  }
};