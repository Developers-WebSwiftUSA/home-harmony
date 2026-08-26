import express from 'express';
import {
  getMyBuyers,
  getMyBuyerDetail,
  getPartners,
  getPartnerDetail,
  getPartnerBuyerDetail
} from '../controllers/crm.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/my-buyers', authorize('seller', 'agent'), getMyBuyers);
router.get('/my-buyers/:buyerId', authorize('seller', 'agent'), getMyBuyerDetail);
router.get('/partners', authorize('admin'), getPartners);
router.get('/partners/:id', authorize('admin'), getPartnerDetail);
router.get('/partners/:partnerId/buyers/:buyerId', authorize('admin'), getPartnerBuyerDetail);

export default router;
