import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    cardHolderName: { type: String, required: true, trim: true },
    cardLast4: { type: String, required: true, minlength: 4, maxlength: 4 },
    cardBrand: { type: String, trim: true, default: 'card' },
    billingEmail: { type: String, required: true, trim: true },
    billingAddress: { type: String, trim: true },
  },
  { _id: false }
);

const adCampaignSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterRole: {
      type: String,
      enum: ['seller', 'agent'],
      required: true,
    },
    adType: {
      type: String,
      enum: ['advertisement', 'sponsored'],
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: paymentSchema,
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'expired', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'charged', 'failed', 'refunded'],
      default: 'pending',
    },
    chargedAmount: { type: Number, default: 0 },
    chargedAt: Date,
    startDate: Date,
    endDate: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
    cancelledAt: Date,
  },
  { timestamps: true }
);

adCampaignSchema.index({ requesterId: 1, status: 1, createdAt: -1 });
adCampaignSchema.index({ propertyId: 1, status: 1 });
adCampaignSchema.index({ status: 1, createdAt: -1 });
adCampaignSchema.index({ status: 1, endDate: 1 });

const AdCampaign = mongoose.model('AdCampaign', adCampaignSchema);

export default AdCampaign;
