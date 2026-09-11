import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.model.js';
import Property from '../models/Property.model.js';
import Tour from '../models/Tour.model.js';
import { emitPendingActionsUpdatedForAdmins } from '../utils/emitPendingActions.js';
import { rankAgentsForProperty } from '../utils/agentProximity.js';
import { ensurePropertyCoordinates } from '../utils/propertyLocation.js';
import { sanitizePreferredArea, stripEmptyPreferredArea } from '../utils/preferredArea.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 10 } = req.query;

  // Build query
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: users
  });
});

// @desc    List public agents for directory / landing pages
// @route   GET /api/users/agents/public
// @access  Public
export const getPublicAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({
    role: 'agent',
    status: 'active',
  })
    .select('firstName lastName email phone avatar agentProfile location')
    .sort({ 'agentProfile.rating.average': -1, firstName: 1, lastName: 1 })
    .lean();

  const counts = agents.length
    ? await Property.aggregate([
        {
          $match: {
            agentId: { $in: agents.map((agent) => agent._id) },
            status: { $in: ['active', 'pending', 'sold', 'rented'] },
          },
        },
        { $group: { _id: '$agentId', count: { $sum: 1 } } },
      ])
    : [];

  const countByAgent = new Map(counts.map((entry) => [String(entry._id), entry.count]));
  const data = agents.map((agent) => ({
    ...agent,
    agentProfile: stripEmptyPreferredArea(agent.agentProfile),
    assignedProperties: countByAgent.get(String(agent._id)) || 0,
  }));

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

// @desc    List active agents (for property assignment)
// @route   GET /api/users/agents/active
// @access  Private/Seller or Admin
export const getActiveAgents = asyncHandler(async (req, res) => {
  const { propertyId } = req.query;
  const agents = await User.find({ role: 'agent', status: 'active' })
    .select('firstName lastName email phone avatar agentProfile location')
    .lean();
  agents.forEach((agent) => {
    agent.agentProfile = stripEmptyPreferredArea(agent.agentProfile);
  });

  let property = null;
  if (propertyId && mongoose.isValidObjectId(propertyId)) {
    const found = await Property.findById(propertyId).select('location sellerId');
    const currentUserId = String(req.user._id || req.user.id);
    const ownsProperty =
      found &&
      (req.user.role === 'admin' || found.sellerId?.toString() === currentUserId);
    if (ownsProperty) {
      const location = await ensurePropertyCoordinates(
        found.location?.toObject ? found.location.toObject() : found.location
      );
      property = { location, sellerId: found.sellerId };
    }
  }

  const listingsByAgent = new Map();
  if (property && agents.length) {
    const listings = await Property.find({
      agentId: { $in: agents.map((agent) => agent._id) },
      status: { $in: ['active', 'pending', 'sold', 'rented'] },
    })
      .select('agentId location')
      .lean();

    listings.forEach((listing) => {
      const agentId = listing.agentId?.toString();
      if (!agentId) return;
      if (!listingsByAgent.has(agentId)) listingsByAgent.set(agentId, []);
      listingsByAgent.get(agentId).push(listing);
    });
  }

  const data = rankAgentsForProperty(agents, property, listingsByAgent);

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

// @desc    Get public agent profile with ratings, reviews, and listings
// @route   GET /api/users/agents/:id/profile
// @access  Public
export const getAgentPublicProfile = asyncHandler(async (req, res) => {
  const agent = await User.findOne({
    _id: req.params.id,
    role: 'agent'
  }).select('-password');

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  const tours = await Tour.find({
    agentId: agent._id,
    status: 'completed',
    'feedback.agentRating': { $exists: true, $ne: null }
  })
    .populate('propertyId', 'title location')
    .populate('buyerId', 'firstName lastName')
    .sort({ 'feedback.submittedAt': -1 })
    .limit(25);

  const [assignedProperties, properties] = await Promise.all([
    Property.countDocuments({
      agentId: agent._id,
      status: { $in: ['active', 'pending', 'sold', 'rented'] }
    }),
    Property.find({
      agentId: agent._id,
      status: 'active',
      viewershipEnabled: { $ne: false },
    })
      .select('title location images price bedrooms bathrooms squareFeet listingType status rating rentalDetails featured promotion promotionPriority')
      .sort({ createdAt: -1 })
      .limit(24),
  ]);

  const reviews = tours.map((tour) => ({
    _id: tour._id,
    propertyTitle: tour.propertyId?.title || 'Property',
    propertyLocation: [
      tour.propertyId?.location?.city,
      tour.propertyId?.location?.state
    ]
      .filter(Boolean)
      .join(', '),
    rating: tour.feedback.agentRating,
    comment: tour.feedback.agentComment || '',
    submittedAt: tour.feedback.submittedAt,
    buyerName:
      `${tour.buyerId?.firstName || ''} ${tour.buyerId?.lastName || ''}`.trim() ||
      'Buyer',
    wouldRecommend: tour.feedback.wouldRecommend,
    overallExperience: tour.feedback.overallExperience
  }));

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
          ).toFixed(1)
        )
      : agent.agentProfile?.rating?.average || 0;

  res.status(200).json({
    success: true,
    data: {
      agent,
      averageRating,
      reviewCount,
      assignedProperties,
      properties,
      reviews
    }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    location: req.body.location,
    avatar: req.body.avatar
  };

  if (req.body.preferences?.distanceUnit) {
    fieldsToUpdate.preferences = { distanceUnit: req.body.preferences.distanceUnit };
  }

  // Role-specific profile updates
  if (req.user.role === 'buyer' && req.body.buyerProfile) {
    fieldsToUpdate.buyerProfile = req.body.buyerProfile;
  }
  if (req.user.role === 'seller' && req.body.sellerProfile) {
    fieldsToUpdate.sellerProfile = req.body.sellerProfile;
  }

  const update = { $set: { ...fieldsToUpdate } };
  Object.keys(update.$set).forEach((key) => {
    if (update.$set[key] === undefined) delete update.$set[key];
  });

  if (req.user.role === 'agent' && req.body.agentProfile) {
    if (Object.prototype.hasOwnProperty.call(req.body.agentProfile, 'preferredArea')) {
      const area = sanitizePreferredArea(req.body.agentProfile.preferredArea);
      if (area) {
        update.$set['agentProfile.preferredArea'] = area;
        if (area.city) update.$set['location.city'] = area.city;
        if (area.state) update.$set['location.state'] = area.state;
        if (area.coordinates) update.$set['location.coordinates'] = area.coordinates;
      } else {
        update.$unset = { 'agentProfile.preferredArea': 1 };
      }
    }
    const restProfile = { ...req.body.agentProfile };
    delete restProfile.preferredArea;
    Object.entries(restProfile).forEach(([key, value]) => {
      if (value !== undefined) update.$set[`agentProfile.${key}`] = value;
    });
  }

  if (!Object.keys(update.$set).length) delete update.$set;
  if (update.$unset && !Object.keys(update.$unset).length) delete update.$unset;

  if (!update.$set && !update.$unset) {
    const current = await User.findById(req.user.id).select('-password');
    return res.status(200).json({ success: true, data: current });
  }

  if (update.$set?.location && (update.$set['location.city'] || update.$set['location.state'] || update.$set['location.coordinates'])) {
    delete update.$set.location;
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    update,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  const payload = user?.toObject ? user.toObject() : user;
  if (payload?.agentProfile) {
    payload.agentProfile = stripEmptyPreferredArea(payload.agentProfile);
  }

  res.status(200).json({
    success: true,
    data: payload
  });
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Verify agent
// @route   PUT /api/users/:id/verify
// @access  Private/Admin
export const verifyAgent = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.role !== 'agent') {
    return res.status(400).json({
      success: false,
      message: 'User is not an agent'
    });
  }

  if (!user.agentProfile) {
    user.agentProfile = { verified: true };
  } else {
    user.agentProfile.verified = true;
  }
  await user.save();
  await emitPendingActionsUpdatedForAdmins(req.app.get('io'));

  res.status(200).json({
    success: true,
    data: user
  });
});
