import FundPayment from "../models/FundPayment.js";
import cloudinary from "../config/cloudinary.js";
import { changeUserBalance } from "./userController.js";

// 📥 Create new fund payment request (by customer)
export const createFundPayment = async (req, res) => {
        const { amount, method, userID, note, branchName } = req.body;
    console.log("createFundPayment", amount, method, userID, note, branchName)
  try {
    console.log("📥 Create Fund Payment Request Body:", req.body);
    console.log("📥 Uploaded File Info:", req.file);

    const { amount, method, userID, note } = req.body;

    if (!amount || !method || !userID) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({ message: "Amount, method, and userID are required" });
    }

    let imgUrl = "";
    if (req.file) {
      // If using multer-storage-cloudinary, req.file.path is already the Cloudinary URL
      imgUrl = req.file.path || req.file.secure_url || "";
      console.log("✅ File uploaded, URL:", imgUrl);
    } else {
      console.log("ℹ️ No file uploaded");
    }

    const fundPayment = new FundPayment({
      amount,
      method,
      imgUrl,
      userID,
      status: "pending",
      requestedDate: new Date(),
      note,
      branchName
    });

    await fundPayment.save();
    console.log("✅ Fund payment saved successfully:", fundPayment._id);

    res.status(201).json({
      message: "✅ Fund payment request submitted successfully",
      fundPayment,
    });
  } catch (error) {
    console.error("❌ Error creating fund payment:", error);
    res.status(500).json({ message: "❌ Error creating fund payment", error: error.message });
  }
};

// controllers/fundPaymentController.js
export const getAllFundPayments = async (req, res) => {
  const fundPayments = await FundPayment.find({})
    .populate({ path: "userID", select: "tempId email username fullName" })
    .lean();

  const result = fundPayments.map(p => ({
    ...p,
    tempId: p.userID?.tempId ?? null,
    userID: p.userID?._id?.toString(),
    email: p.userID?.email ?? "",
    username: p.userID?.username ?? "",
    fullName: p.userID?.fullName ?? "",
  }));

  res.json(result);
};

// 🧾 Get fund payments for a specific user
export const getUserFundPayments = async (req, res) => {
  try {
    const { userID } = req.params;
    console.log(`🧾 Fetching fund payments for user: ${userID}`);
    const fundPayments = await FundPayment.find({ userID });
    console.log(`✅ Total payments found for user ${userID}:`, fundPayments.length);
    res.status(200).json(fundPayments);
  } catch (error) {
    console.error("❌ Error fetching user's fund payments:", error);
    res.status(500).json({ message: "❌ Error fetching user's fund payments", error: error.message });
  }
};

// ✅ Approve or reject fund payment
export const updateFundPaymentStatus = async (req, res) => {
    //     const { id } = req.params;
    // const { status } = req.body;
    console.log("update fund payment status :", req.params, req.body)
  try {
    const { id } = req.params;
    const { status } = req.body;



    console.log(`🔄 Updating fund payment status for ID: ${id} to "${status}"`);

    if (!["approved", "rejected"].includes(status)) {
      console.warn("⚠️ Invalid status value:", status);
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (status === "approved") {
      const updatingFundReq = await FundPayment.findById(id);
      if (updatingFundReq) {
        console.log("update balance :", updatingFundReq._id);
        // Call your backend function to update user's balance
        // await changeUserBalance(updatingFundReq.userID, updatingFundReq.amount, "add");
      }
    }


    const updatedFund = await FundPayment.findByIdAndUpdate(
      id,
      { status, approvedDate: status === "approved" ? new Date() : null },
      { new: true }
    );


    if (!updatedFund) {
      console.warn("⚠️ Fund payment not found:", id);
      return res.status(404).json({ message: "Fund payment not found" });
    }

    console.log("✅ Fund payment status updated:", updatedFund._id);
    res.status(200).json({
      message: "✅ Fund payment status updated",
      fundPayment: updatedFund,
    });
  } catch (error) {
    console.error("❌ Error updating fund payment:", error);
    res.status(500).json({ message: "❌ Error updating fund payment", error: error.message });
  }
};

// 🔴 Delete fund payment
export const deleteFundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Deleting fund payment ID:", id);

    const deleted = await FundPayment.findByIdAndDelete(id);

    if (!deleted) {
      console.warn("⚠️ Fund payment not found for deletion:", id);
      return res.status(404).json({ message: "Fund payment not found" });
    }

    console.log("✅ Fund payment deleted successfully:", id);
    res.status(200).json({ message: "✅ Fund payment deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting fund payment:", error);
    res.status(500).json({ message: "❌ Error deleting fund payment", error: error.message });
  }
};


// // 🧾 Get fund payments for a specific user
// export const getUserFundPayments = async (req, res) => {
//   try {
//     const { userID } = req.params;
//     const fundPayments = await FundPayment.find({ userID });
//     res.status(200).json(fundPayments);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching user's fund payments", error: err.message });
//   }
// };