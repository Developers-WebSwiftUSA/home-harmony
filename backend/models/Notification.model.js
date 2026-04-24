import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must have a user']
  },
  type: {
    type: String,
    enum: [
      'tour_request',
      'tour_confirmed',
      'tour_cancelled',
      'property_approved',
      'property_rejected',
      'new_message',
      'new_inquiry',
      'favorite_price_drop',
      'agent_verified',
      'system_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Property', 'Tour', 'Message', 'User'],
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // Delivery channels
  sentVia: {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true }
  },
  actionUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
