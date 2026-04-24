import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Favorite must have a user']
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Favorite must have a property']
  },
  notes: {
    type: String,
    trim: true
  },
  alerts: {
    priceDrop: { type: Boolean, default: false },
    statusChange: { type: Boolean, default: false },
    newImages: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
favoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1 });
favoriteSchema.index({ propertyId: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
