import mongoose from 'mongoose';

const passwordResetRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  newPassword: {
    type: String,
    select: false // Don't return by default, only when explicitly requested
  },
  reason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const PasswordResetRequest = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);

export default PasswordResetRequest;
