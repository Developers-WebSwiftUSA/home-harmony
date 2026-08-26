import express from 'express';
import {
  getRentalApplications,
  getRentalApplication,
  createRentalApplication,
  updateRentalApplicationStatus
} from '../controllers/rentalApplication.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRentalApplications);
router.get('/:id', getRentalApplication);
router.post('/', authorize('buyer', 'admin'), createRentalApplication);
router.put('/:id/status', updateRentalApplicationStatus);

export default router;
