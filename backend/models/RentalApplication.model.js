import mongoose from 'mongoose';

const rentalApplicationSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Application must be associated with a property']
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Application must have a buyer']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Application must have a seller']
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  moveInDate: Date,
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  statusNote: {
    type: String,
    trim: true
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

rentalApplicationSchema.index({ propertyId: 1, buyerId: 1 });
rentalApplicationSchema.index({ sellerId: 1, status: 1 });
rentalApplicationSchema.index({ agentId: 1, status: 1 });
rentalApplicationSchema.index({ buyerId: 1, createdAt: -1 });

const RentalApplication = mongoose.model('RentalApplication', rentalApplicationSchema);

export default RentalApplication;
