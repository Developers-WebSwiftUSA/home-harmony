import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.model.js';

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

  // Role-specific profile updates
  if (req.user.role === 'buyer' && req.body.buyerProfile) {
    fieldsToUpdate.buyerProfile = req.body.buyerProfile;
  }
  if (req.user.role === 'seller' && req.body.sellerProfile) {
    fieldsToUpdate.sellerProfile = req.body.sellerProfile;
  }
  if (req.user.role === 'agent' && req.body.agentProfile) {
    const current =
      req.user.agentProfile && typeof req.user.agentProfile.toObject === 'function'
        ? req.user.agentProfile.toObject()
        : { ...(req.user.agentProfile || {}) };
    const incoming = { ...req.body.agentProfile };
    delete incoming.verified;
    delete incoming.licenseNumber;
    fieldsToUpdate.agentProfile = { ...current, ...incoming };
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.pendingAgentApprovalHash;
  delete body.pendingAgentApprovalIssuedAt;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    body,
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

  user.agentProfile.verified = true;
  user.pendingAgentApprovalHash = undefined;
  user.pendingAgentApprovalIssuedAt = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Admin issues one-time agent approval license code
// @route   PUT /api/users/:id/issue-agent-license
// @access  Private/Admin
export const issueAgentApprovalCode = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (user.role !== 'agent') {
    return res.status(400).json({ success: false, message: 'User is not an agent' });
  }

  const plain = `HTG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const hash = await bcrypt.hash(plain, 10);
  user.pendingAgentApprovalHash = hash;
  user.pendingAgentApprovalIssuedAt = new Date();
  user.agentProfile = user.agentProfile || {};
  user.agentProfile.verified = false;
  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    success: true,
    message: 'Share this code with the agent once. It replaces any previous code.',
    data: {
      approvalCode: plain,
      issuedAt: user.pendingAgentApprovalIssuedAt,
    },
  });
});

// @desc    Agent redeems admin-issued approval code (one-time)
// @route   POST /api/users/me/redeem-agent-license
// @access  Private/Agent
export const redeemAgentLicense = asyncHandler(async (req, res) => {
  const raw = (req.body?.code || '').trim();
  const code = raw.toUpperCase();
  if (!code) {
    return res.status(400).json({ success: false, message: 'Please enter your approval license code' });
  }

  const user = await User.findById(req.user.id).select('+pendingAgentApprovalHash');

  if (user.role !== 'agent') {
    return res.status(400).json({ success: false, message: 'Only agent accounts use license activation' });
  }
  if (user.agentProfile?.verified) {
    return res.status(400).json({ success: false, message: 'Your agent license is already active' });
  }
  if (!user.pendingAgentApprovalHash) {
    return res.status(400).json({
      success: false,
      message: 'No approval code has been issued yet. Ask an administrator to generate one from your user review page.',
    });
  }

  const match = await bcrypt.compare(code, user.pendingAgentApprovalHash);
  if (!match) {
    return res.status(400).json({ success: false, message: 'Invalid approval license code' });
  }

  user.agentProfile = user.agentProfile || {};
  user.agentProfile.verified = true;
  user.agentProfile.licenseNumber = code;
  user.pendingAgentApprovalHash = undefined;
  user.pendingAgentApprovalIssuedAt = undefined;
  await user.save({ validateBeforeSave: true });

  const updated = await User.findById(user._id).select('-password');

  res.status(200).json({
    success: true,
    message: 'Agent license activated. Welcome!',
    data: updated,
  });
});
