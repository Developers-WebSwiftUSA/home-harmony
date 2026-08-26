import express from 'express';
import {
  getAdPricing,
  getAdCampaigns,
  getAdCampaign,
  createAdCampaign,
  cancelAdCampaign,
  approveAdCampaign,
  rejectAdCampaign,
  endAdCampaign,
} from '../controllers/adCampaign.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/pricing', authorize('seller', 'agent', 'admin'), getAdPricing);
router.get('/', authorize('seller', 'agent', 'admin'), getAdCampaigns);
router.get('/:id', authorize('seller', 'agent', 'admin'), getAdCampaign);
router.post('/', authorize('seller', 'agent'), createAdCampaign);
router.put('/:id/cancel', authorize('seller', 'agent', 'admin'), cancelAdCampaign);
router.put('/:id/approve', authorize('admin'), approveAdCampaign);
router.put('/:id/reject', authorize('admin'), rejectAdCampaign);
router.put('/:id/end', authorize('admin'), endAdCampaign);

export default router;
