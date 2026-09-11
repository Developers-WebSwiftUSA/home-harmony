import express from 'express';
import { getPlatformPricing, updatePlatformPricing } from '../controllers/platformSettings.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/pricing', authorize('admin'), getPlatformPricing);
router.put('/pricing', authorize('admin'), updatePlatformPricing);

export default router;
