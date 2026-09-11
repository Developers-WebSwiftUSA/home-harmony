import express from 'express';
import {
  getGalleryPricing,
  getGallerySettings,
  updateGallerySettings,
  getGalleryUsage,
  getGalleryPurchases,
  getGalleryPurchase,
  createGalleryPurchase,
  cancelGalleryPurchase,
  approveGalleryPurchase,
  rejectGalleryPurchase,
  refundGalleryPurchase,
  grantGallerySlots,
} from '../controllers/gallerySlot.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/pricing', authorize('seller', 'admin'), getGalleryPricing);
router.get('/settings', authorize('admin'), getGallerySettings);
router.put('/settings', authorize('admin'), updateGallerySettings);
router.get('/usage', authorize('admin'), getGalleryUsage);
router.put('/properties/:propertyId/grant', authorize('admin'), grantGallerySlots);
router.get('/', authorize('seller', 'admin'), getGalleryPurchases);
router.post('/', authorize('seller', 'admin'), createGalleryPurchase);
router.get('/:id', authorize('seller', 'admin'), getGalleryPurchase);
router.put('/:id/cancel', authorize('seller', 'admin'), cancelGalleryPurchase);
router.put('/:id/approve', authorize('admin'), approveGalleryPurchase);
router.put('/:id/reject', authorize('admin'), rejectGalleryPurchase);
router.put('/:id/refund', authorize('admin'), refundGalleryPurchase);

export default router;
