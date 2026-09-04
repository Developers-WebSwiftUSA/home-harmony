import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Property from '../models/Property.model.js';
import User from '../models/User.model.js';
import Tour from '../models/Tour.model.js';
import RentalApplication from '../models/RentalApplication.model.js';
import PasswordResetRequest from '../models/PasswordResetRequest.model.js';
import AdCampaign from '../models/AdCampaign.model.js';
import Conversation from '../models/Conversation.model.js';

const objectId = (value) => new mongoose.Types.ObjectId(String(value));

const unreadMessageCount = async (userId) => {
  const key = String(userId);
  const [row] = await Conversation.aggregate([
    { $match: { participants: objectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: { $ifNull: [`$unreadCount.${key}`, 0] } },
      },
    },
  ]);
  return row?.total || 0;
};

const emptyCounts = () => ({
  properties: 0,
  users: 0,
  passwordResets: 0,
  adCampaigns: 0,
  tours: 0,
  applications: 0,
  messages: 0,
});

// @desc    Un-responded pending actions for the current dashboard role
// @route   GET /api/pending-actions
// @access  Private
export const getPendingActions = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;
  const counts = emptyCounts();

  const messagesPromise = unreadMessageCount(userId);

  if (role === 'admin') {
    const [properties, users, passwordResets, adCampaigns, tours, messages] = await Promise.all([
      Property.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'agent', 'agentProfile.verified': { $ne: true } }),
      PasswordResetRequest.countDocuments({ status: 'pending' }),
      AdCampaign.countDocuments({ status: 'pending' }),
      Tour.countDocuments({ status: 'pending' }),
      messagesPromise,
    ]);
    Object.assign(counts, { properties, users, passwordResets, adCampaigns, tours, messages });
  } else if (role === 'seller') {
    const [tours, applications, messages] = await Promise.all([
      Tour.countDocuments({ sellerId: userId, status: 'pending' }),
      RentalApplication.countDocuments({
        sellerId: userId,
        status: { $in: ['pending', 'reviewing'] },
      }),
      messagesPromise,
    ]);
    Object.assign(counts, { tours, applications, messages });
  } else if (role === 'agent') {
    const [tours, applications, messages] = await Promise.all([
      Tour.countDocuments({ agentId: userId, status: 'pending' }),
      RentalApplication.countDocuments({
        agentId: userId,
        status: { $in: ['pending', 'reviewing'] },
      }),
      messagesPromise,
    ]);
    Object.assign(counts, { tours, applications, messages });
  } else if (role === 'buyer') {
    const [tours, messages] = await Promise.all([
      Tour.countDocuments({
        buyerId: userId,
        status: 'reschedule_pending_buyer_approval',
      }),
      messagesPromise,
    ]);
    Object.assign(counts, { tours, messages });
  } else {
    counts.messages = await messagesPromise;
  }

  res.status(200).json({ success: true, data: counts });
});
