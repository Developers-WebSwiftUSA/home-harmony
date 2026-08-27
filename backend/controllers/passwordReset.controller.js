import asyncHandler from '../middleware/asyncHandler.js';
import PasswordResetRequest from '../models/PasswordResetRequest.model.js';
import { sendEmail } from '../utils/sendEmail.js';
import { setUserPasswordById } from '../utils/userPassword.js';

const userIdOf = (value) => value?._id || value;

const sendPasswordEmail = async ({ email, newPassword, subject, intro }) => {
  const result = await sendEmail({
    email,
    subject,
    text: `${intro} Your new password is: ${newPassword}\n\nPlease change this password after logging in.`,
    html: `<p>${intro}</p><p><strong>Your new password is: ${newPassword}</strong></p><p>Please change this password after logging in for security.</p>`,
  });
  return Boolean(result?.sent);
};

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
    .select('+newPassword')
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

  const updated = await setUserPasswordById(userIdOf(request.userId));
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'User not found for this reset request'
    });
  }

  request.status = 'approved';
  request.reviewedAt = new Date();
  request.reviewedBy = req.user.id;
  request.newPassword = updated.newPassword;
  await request.save();

  const emailSent = await sendPasswordEmail({
    email: request.email || updated.user.email,
    newPassword: updated.newPassword,
    subject: 'Password Reset Approved',
    intro: 'Your password reset request has been approved.',
  });

  const updatedRequest = await PasswordResetRequest.findById(req.params.id)
    .populate('userId', 'firstName lastName email role')
    .populate('reviewedBy', 'firstName lastName email')
    .select('+newPassword');

  res.status(200).json({
    success: true,
    message: emailSent
      ? 'Password reset approved. New password has been sent to the user.'
      : 'Password reset approved. Email could not be sent — copy the password below and share it with the user.',
    emailSent,
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

  await sendEmail({
    email: request.email,
    subject: 'Password Reset Request Rejected',
    text: `Your password reset request has been rejected.${reason ? ` Reason: ${reason}` : ''}\n\nPlease contact support if you believe this is an error.`,
    html: `<p>Your password reset request has been rejected.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}<p>Please contact support if you believe this is an error.</p>`
  });

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

  const updated = await setUserPasswordById(userId);
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const resetRecord = await PasswordResetRequest.create({
    userId: updated.user._id,
    email: updated.user.email,
    status: 'approved',
    reason: 'Password reset by administrator',
    reviewedAt: new Date(),
    reviewedBy: req.user.id,
    newPassword: updated.newPassword,
  });

  const emailSent = await sendPasswordEmail({
    email: updated.user.email,
    newPassword: updated.newPassword,
    subject: 'Password Reset by Admin',
    intro: 'Your password has been reset by an administrator.',
  });

  res.status(200).json({
    success: true,
    message: emailSent
      ? 'Password reset successfully. New password emailed to the user.'
      : 'Password reset successfully. Email could not be sent — copy the password below.',
    emailSent,
    data: {
      userId: String(updated.user._id),
      email: updated.user.email,
      newPassword: updated.newPassword,
      requestId: resetRecord._id,
    }
  });
});
