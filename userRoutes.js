import express from "express";
import { getAllUsers, getUser, updateUser, deleteUser, addRemainingAds, getluckydrawStatus, getCurrentBalance, addTopup, getRemaining, localStorageRefresh } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only: get all users
router.get("/all", verifyToken, getAllUsers);

router.get("/", verifyToken, getUser);
router.patch("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.patch("/add-remaining/:id", addRemainingAds);
router.get("/luckydraw", verifyToken, getluckydrawStatus);

router.get("/get-current-balance/:id", getCurrentBalance);
router.patch("/add-topup/:id", verifyToken, addTopup);
router.get("/remaining", verifyToken, getRemaining);
router.get("/refreshLocalStorage/:id", verifyToken, localStorageRefresh);




export default router;
