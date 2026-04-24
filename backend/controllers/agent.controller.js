import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.model.js';
import Property from '../models/Property.model.js';

function toPublicAgent(user, propertyCount) {
  const u = user?.toObject ? user.toObject({ virtuals: true }) : { ...user };
  const ap = { ...(u.agentProfile || {}) };
  delete ap.licenseNumber;

  const loc = u.location;
  let locationLine = '';
  if (loc && (loc.city || loc.state)) {
    locationLine = [loc.city, loc.state].filter(Boolean).join(', ');
  }

  const specs = Array.isArray(ap.specialization) ? ap.specialization.filter(Boolean) : [];
  const roleTitle = specs.length ? specs.join(' · ') : 'Property specialist';

  const rating = ap.rating || { average: 0, count: 0 };

  return {
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone || '',
    avatar: u.avatar || '',
    location: locationLine,
    roleTitle,
    agentProfile: {
      bio: ap.bio,
      yearsOfExperience: ap.yearsOfExperience,
      languages: ap.languages,
      rating: {
        average: rating.average ?? 0,
        count: rating.count ?? 0,
      },
    },
    propertyCount,
  };
}

const publicAgentMatch = {
  role: 'agent',
  'agentProfile.verified': true,
  status: { $nin: ['suspended', 'inactive'] },
};

// @desc    List verified agents (public directory)
// @route   GET /api/agents
// @access  Public
export const getPublicAgents = asyncHandler(async (req, res) => {
  const agents = await User.find(publicAgentMatch)
    .select('firstName lastName email phone avatar location agentProfile')
    .sort({ createdAt: -1 })
    .lean();

  const data = await Promise.all(
    agents.map(async (a) => {
      const propertyCount = await Property.countDocuments({ agentId: a._id });
      return toPublicAgent(a, propertyCount);
    })
  );

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

// @desc    Get one verified agent (public)
// @route   GET /api/agents/:id
// @access  Public
export const getPublicAgent = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid agent id',
    });
  }

  const user = await User.findOne({
    _id: req.params.id,
    ...publicAgentMatch,
  })
    .select('firstName lastName email phone avatar location agentProfile')
    .lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found',
    });
  }

  const propertyCount = await Property.countDocuments({ agentId: user._id });

  res.status(200).json({
    success: true,
    data: toPublicAgent(user, propertyCount),
  });
});
