import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Tour must be associated with a property']
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tour must have a buyer']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tour must have a seller']
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Please provide a tour date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide an end time']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'reschedule_requested', 'reschedule_pending_buyer_approval', 'completed', 'cancelled', 'declined'],
    default: 'pending'
  },
  cancelledBy: {
    type: String,
    enum: ['buyer', 'seller', 'agent', 'admin', 'system'],
    default: null
  },
  cancellationReason: String,
  // Buyer message/notes
  message: {
    type: String,
    trim: true
  },
  // Rescheduling history
  rescheduleHistory: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedByRole: {
      type: String,
      enum: ['buyer', 'seller', 'agent', 'admin'],
      required: true
    },
    oldDate: Date,
    oldStartTime: String,
    oldEndTime: String,
    newDate: Date,
    newStartTime: String,
    newEndTime: String,
    reason: String,
    comment: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Current reschedule request (if any)
  pendingReschedule: {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedByRole: String,
    newDate: Date,
    newStartTime: String,
    newEndTime: String,
    reason: String,
    comment: String,
    requestedAt: Date
  },
  // Tour details
  tourType: {
    type: String,
    enum: ['in-person', 'virtual', 'open-house'],
    default: 'in-person'
  },
  // Calendar integration
  googleCalendarEventId: String,
  // Reminders
  remindersSent: {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  // Feedback and Reviews
  feedback: {
    propertyRating: {
      type: Number,
      min: 1,
      max: 5
    },
    agentRating: {
      type: Number,
      min: 1,
      max: 5
    },
    propertyComment: String,
    agentComment: String,
    overallExperience: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor']
    },
    wouldRecommend: Boolean,
    submittedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
tourSchema.index({ propertyId: 1 });
tourSchema.index({ buyerId: 1 });
tourSchema.index({ sellerId: 1 });
tourSchema.index({ agentId: 1 });
tourSchema.index({ date: 1, startTime: 1 });
tourSchema.index({ status: 1 });

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
