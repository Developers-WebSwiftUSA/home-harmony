import express from 'express';
import {
  getAdminAnalytics,
  getSellerAnalytics,
  getAgentAnalytics,
} from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminAnalytics);
router.get('/seller', authorize('seller'), getSellerAnalytics);
router.get('/agent', authorize('agent'), getAgentAnalytics);

export default router;
