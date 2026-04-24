import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
