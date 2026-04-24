import express from 'express';
import {
  getTours,
  getTour,
  createTour,
  updateTourStatus,
  getAvailability,
  submitFeedback,
  approveTour,
  declineTour,
  rescheduleTour,
  approveReschedule,
  rejectReschedule,
  markComplete
} from '../controllers/tour.controller.js';
import { protect, authorize, blockUnverifiedAgent } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route
router.get('/availability', getAvailability);

// All other routes require authentication
router.use(protect);

router.get('/', blockUnverifiedAgent, getTours);
router.get('/:id', blockUnverifiedAgent, getTour);
router.post('/', authorize('buyer', 'admin'), createTour);
router.put('/:id/status', blockUnverifiedAgent, updateTourStatus);
router.put('/:id/approve', authorize('seller', 'agent', 'admin'), blockUnverifiedAgent, approveTour);
router.put('/:id/decline', authorize('seller', 'agent', 'admin'), blockUnverifiedAgent, declineTour);
router.put('/:id/reschedule', authorize('seller', 'agent', 'admin'), blockUnverifiedAgent, rescheduleTour);
router.put('/:id/approve-reschedule', authorize('buyer'), approveReschedule);
router.put('/:id/reject-reschedule', authorize('buyer'), rejectReschedule);
router.put('/:id/complete', authorize('buyer'), markComplete);
router.put('/:id/feedback', authorize('buyer', 'seller'), submitFeedback);

export default router;
