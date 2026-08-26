import express from 'express';
import {
  getUsers,
  getPublicAgents,
  getActiveAgents,
  getAgentPublicProfile,
  getUser,
  getMyProfile,
  updateProfile,
  updateUser,
  deleteUser,
  verifyAgent
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/agents/public', getPublicAgents);
router.get('/agents/:id/profile', getAgentPublicProfile);

// All routes below require authentication
router.use(protect);

router.get('/me', getMyProfile);
router.put('/me', updateProfile);
router.get('/agents/active', authorize('seller', 'admin'), getActiveAgents);
router.get(['/', ''], authorize('admin'), getUsers);
router.get('/:id', getUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/verify', authorize('admin'), verifyAgent);

export default router;
