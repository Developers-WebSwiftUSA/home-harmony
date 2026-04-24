import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty,
  searchNearby,
  getMyProperties,
  getAgentProperties
} from '../controllers/property.controller.js';
import { protect, authorize, blockUnverifiedAgent } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/search/nearby', searchNearby);
router.get('/:id', getProperty); // Public - anyone can view property details

// Protected routes
router.use(protect);

router.get('/mine', authorize('seller', 'admin'), getMyProperties);
router.get('/agent', authorize('agent', 'admin'), blockUnverifiedAgent, getAgentProperties);
router.post('/', authorize('seller', 'admin'), createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

// Admin only routes
router.put('/:id/approve', authorize('admin'), approveProperty);
router.put('/:id/reject', authorize('admin'), rejectProperty);

export default router;
