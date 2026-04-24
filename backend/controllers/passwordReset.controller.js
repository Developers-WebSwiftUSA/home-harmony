import asyncHandler from '../middleware/asyncHandler.js';
import PasswordResetRequest from '../models/PasswordResetRequest.model.js';
import User from '../models/User.model.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Get all password reset requests
// @route   GET /api/password-resets
// @access  Private/Admin
export const getPasswordResetRequests = asyncHandler(async (req, res) => {
  const { status, userId } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }
  if (userId) {
    query.userId = userId;
  }

  const requests = await PasswordResetRequest.find(query)
    .populate('userId', 'firstName lastName email role')
    .populate('reviewedBy', 'firstName lastName email')
    .select('+newPassword') // Include password for approved requests
    .sort({ requestedAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Approve password reset request
// @route   PUT /api/password-resets/:id/approve
// @access  Private/Admin
export const approvePasswordReset = asyncHandler(async (req, res) => {
  const request = await PasswordResetRequest.findById(req.params.id).populate('userId');

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Password reset request not found'
    });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Request is already ${request.status}`
    });
  }

  // Generate new random password
  const newPassword = crypto.randomBytes(8).toString('hex');

  // Update user password
  const user = await User.findById(request.userId._id).select('+password');
  user.password = newPassword;
  await user.save();

  // Update request status
  request.status = 'approved';
  request.reviewedAt = new Date();
  request.reviewedBy = req.user.id;
  request.newPassword = newPassword; // Store temporarily for admin to see
  await request.save();

  // Send email to user with new password
  try {
    await sendEmail({
      email: request.email,
      subject: 'Password Reset Approved',
      text: `Your password reset request has been approved. Your new password is: ${newPassword}\n\nPlease change this password after logging in.`,
      html: `<p>Your password reset request has been approved.</p><p><strong>Your new password is: ${newPassword}</strong></p><p>Please change this password after logging in for security.</p>`
    });
  } catch (error) {
    console.error('Email error:', error);
  }

  const updatedRequest = await PasswordResetRequest.findById(req.params.id)
    .populate('userId', 'firstName lastName email role')
    .populate('reviewedBy', 'firstName lastName email')
    .select('+newPassword');

  res.status(200).json({
    success: true,
    message: 'Password reset approved. New password has been sent to user.',
    data: updatedRequest
  });
});

// @desc    Reject password reset request
// @route   PUT /api/password-resets/:id/reject
// @access  Private/Admin
export const rejectPasswordReset = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const request = await PasswordResetRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Password reset request not found'
    });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Request is already ${request.status}`
    });
  }

  request.status = 'rejected';
  request.reviewedAt = new Date();
  request.reviewedBy = req.user.id;
  if (reason) request.reason = reason;
  await request.save();

  // Send email to user
  try {
    await sendEmail({
      email: request.email,
      subject: 'Password Reset Request Rejected',
      text: `Your password reset request has been rejected.${reason ? ` Reason: ${reason}` : ''}\n\nPlease contact support if you believe this is an error.`,
      html: `<p>Your password reset request has been rejected.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}<p>Please contact support if you believe this is an error.</p>`
    });
  } catch (error) {
    console.error('Email error:', error);
  }

  const updatedRequest = await PasswordResetRequest.findById(req.params.id)
    .populate('userId', 'firstName lastName email role')
    .populate('reviewedBy', 'firstName lastName email');

  res.status(200).json({
    success: true,
    message: 'Password reset request rejected',
    data: updatedRequest
  });
});

// @desc    Reset user password (Admin can reset any user's password)
// @route   PUT /api/password-resets/reset/:userId
// @access  Private/Admin
export const adminResetPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Generate new random password
  const newPassword = crypto.randomBytes(8).toString('hex');

  // Update user password
  user.password = newPassword;
  await user.save();

  // Send email to user
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset by Admin',
      text: `Your password has been reset by an administrator. Your new password is: ${newPassword}\n\nPlease change this password after logging in.`,
      html: `<p>Your password has been reset by an administrator.</p><p><strong>Your new password is: ${newPassword}</strong></p><p>Please change this password after logging in for security.</p>`
    });
  } catch (error) {
    console.error('Email error:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
    data: {
      userId: user._id,
      email: user.email,
      newPassword: newPassword // Return so admin can see it
    }
  });
});
