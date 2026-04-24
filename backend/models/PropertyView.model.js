import mongoose from 'mongoose';

const propertyViewSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for anonymous views
  },
  ipAddress: String,
  userAgent: String,
  viewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
propertyViewSchema.index({ propertyId: 1, viewedAt: -1 });
propertyViewSchema.index({ userId: 1 });

const PropertyView = mongoose.model('PropertyView', propertyViewSchema);

export default PropertyView;
