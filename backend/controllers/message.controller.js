import asyncHandler from '../middleware/asyncHandler.js';
import mongoose from 'mongoose';
import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import Notification from '../models/Notification.model.js';
import Property from '../models/Property.model.js';
import User from '../models/User.model.js';
import { buildDirectKey } from '../utils/conversationKey.js';
import { emitPendingActionsUpdated } from '../utils/emitPendingActions.js';

const toObjectId = (value) => {
  if (!value) return null;
  try {
    return new mongoose.Types.ObjectId(String(value));
  } catch {
    return null;
  }
};

const toParticipantId = (participant) => String(participant?._id || participant);

const isConversationParticipant = (conversation, userId) => {
  const uid = String(userId || '');
  if (!conversation?.participants?.length || !uid) return false;
  return conversation.participants.some((participant) => toParticipantId(participant) === uid);
};


const populateConversation = (query) =>
  query
    .populate('participants', 'firstName lastName email avatar role')
    .populate('propertyId', 'title images');

const findConversationBetweenUsers = async (participantIds, { propertyId = null } = {}) => {
  const directKey = buildDirectKey(participantIds, propertyId);
  if (!directKey) return null;

  return populateConversation(Conversation.findOne({ directKey }));
};

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

  const currentUserId = toObjectId(req.user._id || req.user.id);
  const otherUserId = toObjectId(userId);
  const propertyObjectId = propertyId ? toObjectId(propertyId) : null;

  if (!currentUserId || !otherUserId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user id'
    });
  }

  if (currentUserId.equals(otherUserId)) {
    return res.status(400).json({
      success: false,
      message: 'You cannot message yourself'
    });
  }

  const participantIds = [currentUserId, otherUserId];

  let conversation = await findConversationBetweenUsers(participantIds, {
    propertyId: propertyObjectId
  });

  if (!conversation) {
    const directKey = buildDirectKey(participantIds, propertyObjectId);
    try {
      conversation = await Conversation.create({
        participants: participantIds,
        directKey,
        ...(propertyObjectId && { propertyId: propertyObjectId }),
        unreadCount: new Map()
      });
      conversation = await populateConversation(Conversation.findById(conversation._id));
    } catch (err) {
      if (err.code === 11000) {
        conversation = await findConversationBetweenUsers(participantIds, {
          propertyId: propertyObjectId
        });
      } else {
        throw err;
      }
    }
  }

  if (!conversation) {
    return res.status(500).json({
      success: false,
      message: 'Could not open conversation'
    });
  }

  res.status(200).json({
    success: true,
    data: conversation
  });
});

// @desc    Get or create conversation for a property (routes to assigned agent, else seller)
// @route   GET /api/messages/property/:propertyId/conversation
// @access  Private
export const getOrCreatePropertyConversation = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  const contactUserId = property.agentId || property.sellerId;
  if (!contactUserId) {
    return res.status(400).json({
      success: false,
      message: 'No contact available for this property'
    });
  }

  const currentUserId = toObjectId(req.user._id || req.user.id);
  const contactObjectId = toObjectId(contactUserId);
  const propertyObjectId = toObjectId(propertyId);

  if (!currentUserId || !contactObjectId || !propertyObjectId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid conversation reference'
    });
  }

  if (contactObjectId.equals(currentUserId)) {
    return res.status(400).json({
      success: false,
      message: 'You cannot message yourself about this property'
    });
  }

  const participantIds = [currentUserId, contactObjectId];

  let conversation = await findConversationBetweenUsers(participantIds, {
    propertyId: propertyObjectId
  });

  const isNewConversation = !conversation;

  if (!conversation) {
    const directKey = buildDirectKey(participantIds, propertyObjectId);
    try {
      conversation = await Conversation.create({
        participants: participantIds,
        directKey,
        propertyId: propertyObjectId,
        unreadCount: new Map()
      });
      conversation = await populateConversation(Conversation.findById(conversation._id));
    } catch (err) {
      if (err.code === 11000) {
        conversation = await findConversationBetweenUsers(participantIds, {
          propertyId: propertyObjectId
        });
      } else {
        throw err;
      }
    }

    if (isNewConversation && conversation) {
      property.inquiries = (property.inquiries || 0) + 1;
      await property.save();
    }
  }

  if (!conversation) {
    return res.status(500).json({
      success: false,
      message: 'Could not open conversation'
    });
  }

  const contactUser = await User.findById(contactUserId).select(
    'firstName lastName email avatar role phone'
  );

  res.status(200).json({
    success: true,
    data: conversation,
    contactUser,
    contactedRole: property.agentId ? 'agent' : 'seller',
    isNewConversation
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
  if (!conversation || !isConversationParticipant(conversation, req.user.id)) {
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

  const previousUnread = conversation.unreadCount.get(req.user.id.toString()) || 0;
  conversation.unreadCount.set(req.user.id.toString(), 0);
  await conversation.save();
  if (previousUnread > 0) {
    emitPendingActionsUpdated(req.app.get('io'), req.user.id);
  }

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
    if (!conversation || !isConversationParticipant(conversation, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
  } else if (receiverId) {
    const currentUserId = toObjectId(req.user._id || req.user.id);
    const otherUserId = toObjectId(receiverId);
    const participantIds =
      currentUserId && otherUserId ? [currentUserId, otherUserId] : null;

    conversation = participantIds
      ? await findConversationBetweenUsers(participantIds)
      : null;

    if (!conversation && participantIds) {
      const directKey = buildDirectKey(participantIds);
      try {
        conversation = await Conversation.create({
          participants: participantIds,
          directKey,
          unreadCount: new Map()
        });
      } catch (err) {
        if (err.code === 11000) {
          conversation = await findConversationBetweenUsers(participantIds);
        } else {
          throw err;
        }
      }
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
    const previousUnread = conversation.unreadCount.get(req.user.id.toString()) || 0;
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();
    if (previousUnread > 0) {
      emitPendingActionsUpdated(req.app.get('io'), req.user.id);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Messages marked as read'
  });
});
