import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.model.js';
import PasswordResetRequest from '../models/PasswordResetRequest.model.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { SUPER_ADMIN_EMAIL } from '../config/seed.js';
import { buildDefaultAvatar, formatAuthUser } from '../utils/formatAuthUser.js';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { email, password, role, firstName, lastName, phone } = req.body;
  const normalizedRole = (role || "buyer").toLowerCase();
  const normalizedEmail = (email || "").toLowerCase().trim();

  if (normalizedEmail === SUPER_ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      message: 'This email is reserved and cannot be used for registration.',
    });
  }

  // Admin accounts cannot be self-registered.
  // Admin role should only be assigned by an existing admin.
  if (normalizedRole === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin signup is disabled. Admin role can only be assigned by an existing admin.",
    });
  }

  // Check if user exists
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Create user with profile picture from registration name
  const user = await User.create({
    email: normalizedEmail,
    password,
    role: normalizedRole,
    firstName,
    lastName,
    phone,
    avatar: buildDefaultAvatar({ firstName, lastName, email: normalizedEmail }),
  });

  // Generate token
  const token = generateToken(user._id);

  // Send welcome email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Real Estate Platform',
      text: `Welcome ${user.firstName || user.email}! Your account has been created successfully.`,
      html: `<h1>Welcome ${user.firstName || user.email}!</h1><p>Your account has been created successfully.</p>`
    });
  } catch (error) {
    console.error('Welcome email error:', error);
  }

  res.status(201).json({
    success: true,
    data: {
      user: formatAuthUser(user),
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is active
  if (user.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Account is not active. Please contact support.'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      user: formatAuthUser(user),
      token
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: formatAuthUser(user)
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id);

  // Get updated user without password
  const updatedUser = await User.findById(user._id).select('-password');

  res.status(200).json({
    success: true,
    data: {
      user: formatAuthUser(updatedUser),
      token
    }
  });
});

// @desc    Forgot password - Request password reset (admin approval required)
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, reason } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if there's already a pending request
  const existingRequest = await PasswordResetRequest.findOne({
    userId: user._id,
    status: 'pending'
  });

  if (existingRequest) {
    return res.status(400).json({
      success: false,
      message: 'You already have a pending password reset request. Please wait for admin approval.'
    });
  }

  // Create password reset request
  const resetRequest = await PasswordResetRequest.create({
    userId: user._id,
    email: user.email,
    reason: reason || 'User requested password reset'
  });

  res.status(200).json({
    success: true,
    message: 'Password reset request submitted. An admin will review your request shortly.',
    data: {
      requestId: resetRequest._id
    }
  });
});
