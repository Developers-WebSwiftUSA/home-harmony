import express from 'express';
import {
  getUsers,
  getUser,
  getMyProfile,
  updateProfile,
  updateUser,
  deleteUser,
  verifyAgent,
  issueAgentApprovalCode,
  redeemAgentLicense,
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/me/redeem-agent-license', authorize('agent'), redeemAgentLicense);
router.get('/me', getMyProfile);
router.put('/me', updateProfile);
router.get('/', authorize('admin'), getUsers);
router.put('/:id/issue-agent-license', authorize('admin'), issueAgentApprovalCode);
router.put('/:id/verify', authorize('admin'), verifyAgent);
router.get('/:id', getUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
