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
  suggestLocations,
  getMyProperties,
  getAgentProperties,
  assignAgent,
  setPropertyViewership
} from '../controllers/property.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/search/nearby', searchNearby);
router.get('/locations/suggest', suggestLocations);
router.get('/mine', protect, authorize('seller', 'admin'), getMyProperties);
router.get('/agent', protect, authorize('agent', 'admin'), getAgentProperties);
router.get('/:id', optionalAuth, getProperty);

// Protected routes
router.use(protect);

router.post('/', authorize('seller', 'admin'), createProperty);
router.put('/:id/assign-agent', authorize('seller', 'admin'), assignAgent);
router.put('/:id/viewership', setPropertyViewership);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

// Admin only routes
router.put('/:id/approve', authorize('admin'), approveProperty);
router.put('/:id/reject', authorize('admin'), rejectProperty);

export default router;
