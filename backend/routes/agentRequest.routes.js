import express from 'express';
import {
  getAgentRequests,
  getAgentRequest,
  createAgentRequest,
  cancelAgentRequest,
  approveAgentRequest,
  rejectAgentRequest,
} from '../controllers/agentRequest.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('seller', 'admin'), getAgentRequests);
router.get('/:id', authorize('seller', 'admin'), getAgentRequest);
router.post('/', authorize('seller'), createAgentRequest);
router.put('/:id/cancel', authorize('seller', 'admin'), cancelAgentRequest);
router.put('/:id/approve', authorize('admin'), approveAgentRequest);
router.put('/:id/reject', authorize('admin'), rejectAgentRequest);

export default router;
