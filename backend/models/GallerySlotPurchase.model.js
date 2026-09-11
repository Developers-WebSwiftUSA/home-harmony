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

const gallerySlotPurchaseSchema = new mongoose.Schema(
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
      enum: ['seller', 'admin'],
      required: true,
    },
    slotsRequested: {
      type: Number,
      required: true,
      min: 1,
    },
    slotsGranted: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricePerSlot: {
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
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'charged', 'failed', 'refunded'],
      default: 'pending',
    },
    chargedAmount: { type: Number, default: 0 },
    chargedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
    cancelledAt: Date,
    refundedAt: Date,
  },
  { timestamps: true }
);

gallerySlotPurchaseSchema.index({ requesterId: 1, status: 1, createdAt: -1 });
gallerySlotPurchaseSchema.index({ propertyId: 1, status: 1 });
gallerySlotPurchaseSchema.index({ status: 1, createdAt: -1 });

const GallerySlotPurchase = mongoose.model('GallerySlotPurchase', gallerySlotPurchaseSchema);

export default GallerySlotPurchase;
