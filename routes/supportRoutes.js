import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  createTicket,
  getTickets,
  getTicketById,
  addReply,
  updateStatus,
  deleteTicket
} from "../controllers/supportController.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "support_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const parser = multer({ storage });

const router = express.Router();

router.post("/", parser.single("image"), createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.post("/:id/reply", parser.single("image"), addReply);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteTicket);

export default router;
