import express from 'express';
import {
  getPasswordResetRequests,
  approvePasswordReset,
  rejectPasswordReset,
  adminResetPassword
} from '../controllers/passwordReset.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

router.get('/', getPasswordResetRequests);
router.put('/:id/approve', approvePasswordReset);
router.put('/:id/reject', rejectPasswordReset);
router.put('/reset/:userId', adminResetPassword);

export default router;
