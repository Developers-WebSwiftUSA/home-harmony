import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";
import { uploadSingleImage } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/image", protect, authorize("seller", "agent", "admin"), uploadImage, uploadSingleImage);

export default router;

