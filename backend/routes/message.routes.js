import express from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getOrCreatePropertyConversation,
  getMessages,
  sendMessage,
  markAsRead
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/conversations', getConversations);
router.get('/property/:propertyId/conversation', getOrCreatePropertyConversation);
router.get('/conversations/:userId', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);

export default router;
