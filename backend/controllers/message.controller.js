import asyncHandler from '../middleware/asyncHandler.js';
import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import Notification from '../models/Notification.model.js';

// @desc    Get all conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
    isArchived: false
  })
    .populate('participants', 'firstName lastName email avatar role')
    .populate('propertyId', 'title images')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations
  });
});

// @desc    Get or create conversation
// @route   GET /api/messages/conversations/:userId
// @access  Private
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { propertyId } = req.query;

  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user.id, userId] },
    ...(propertyId && { propertyId })
  })
    .populate('participants', 'firstName lastName email avatar role')
    .populate('propertyId', 'title images');

  // Create if doesn't exist
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user.id, userId],
      ...(propertyId && { propertyId }),
      unreadCount: new Map()
    });
    await conversation.populate('participants', 'firstName lastName email avatar role');
    if (propertyId) {
      await conversation.populate('propertyId', 'title images');
    }
  }

  res.status(200).json({
    success: true,
    data: conversation
  });
});

// @desc    Get messages in conversation
// @route   GET /api/messages/conversations/:conversationId/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Verify user is part of conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this conversation'
    });
  }

  const messages = await Message.find({
    conversationId,
    isDeleted: false
  })
    .populate('senderId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Mark messages as read
  await Message.updateMany(
    {
      conversationId,
      receiverId: req.user.id,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  // Update conversation unread count
  conversation.unreadCount.set(req.user.id.toString(), 0);
  await conversation.save();

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages.reverse() // Reverse to show oldest first
  });
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, receiverId, content, messageType = 'text', attachments } = req.body;

  let conversation;

  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
  } else if (receiverId) {
    // Find or create conversation
    conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
        unreadCount: new Map()
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: 'Please provide conversationId or receiverId'
    });
  }

  const receiver = conversation.participants.find(
    p => p.toString() !== req.user.id.toString()
  );

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: req.user.id,
    receiverId: receiver || receiverId,
    content,
    messageType,
    attachments
  });

  // Update conversation
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();
  const currentUnread = conversation.unreadCount.get(receiver?.toString() || receiverId) || 0;
  conversation.unreadCount.set(receiver?.toString() || receiverId, currentUnread + 1);
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('senderId', 'firstName lastName avatar')
    .populate('receiverId', 'firstName lastName avatar');

  // Emit real-time message via Socket.IO
  const io = req.app.get('io');
  if (io) {
    // Emit to the receiver's user room
    io.to(`user-${receiver || receiverId}`).emit('new-message', populatedMessage);
    // Also emit to the sender so they see their own message instantly
    io.to(`user-${req.user.id}`).emit('new-message', populatedMessage);
  }

  // Create notification
  await Notification.create({
    userId: receiver || receiverId,
    type: 'new_message',
    title: 'New Message',
    message: `You have a new message from ${req.user.firstName || req.user.email}`,
    relatedId: message._id,
    relatedModel: 'Message'
  });

  res.status(201).json({
    success: true,
    data: populatedMessage
  });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/conversations/:conversationId/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await Message.updateMany(
    {
      conversationId,
      receiverId: req.user.id,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();
  }

  res.status(200).json({
    success: true,
    message: 'Messages marked as read'
  });
});
