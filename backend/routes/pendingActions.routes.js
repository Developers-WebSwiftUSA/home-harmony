import express from 'express';
import { getPendingActions } from '../controllers/pendingActions.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getPendingActions);

export default router;
