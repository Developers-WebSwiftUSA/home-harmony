import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property must have a seller']
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Please provide a property title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a property description']
  },
  type: {
    type: String,
    enum: ['House', 'Apartment', 'Villa', 'Commercial', 'Land', 'Condo', 'Townhouse'],
    required: [true, 'Please specify property type']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'sold', 'rented', 'inactive', 'rejected'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0
  },
  // Location
  location: {
    address: {
      type: String,
      required: [true, 'Please provide an address']
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - optional for listings without map pin
        required: false
      }
    }
  },
  // Property details
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  squareFeet: {
    type: Number,
    required: true,
    min: 0
  },
  lotSize: Number,
  yearBuilt: Number,
  garage: {
    type: Number,
    default: 0
  },
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  // Features and amenities
  amenities: [{
    type: String
  }],
  features: {
    airConditioning: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    fireplace: { type: Boolean, default: false },
    garden: { type: Boolean, default: false }
  },
  // Listing details
  listingType: {
    type: String,
    enum: ['sale', 'rent', 'both'],
    default: 'sale'
  },
  availabilityDate: Date,
  rentalDetails: {
    deposit: { type: Number, default: 0 },
    petFee: { type: Number, default: 0 },
    petPolicy: {
      type: String,
      enum: ['allowed', 'not_allowed', 'negotiable'],
      default: 'negotiable'
    },
    furnished: { type: Boolean, default: false },
    laundry: {
      type: String,
      enum: ['in_unit', 'shared', 'none'],
      default: 'none'
    },
    acceptsApplications: { type: Boolean, default: true },
    monthlyFees: [{
      label: String,
      amount: Number
    }],
    utilitiesIncluded: [String]
  },
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  // Metadata
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  promotion: {
    type: {
      type: String,
      enum: ['advertisement', 'sponsored']
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdCampaign'
    },
    expiresAt: Date
  },
  promotionPriority: {
    type: Number,
    default: 0,
    min: 0,
    max: 2
  },
  viewershipEnabled: {
    type: Boolean,
    default: true
  },
  viewershipPausedAt: Date,
  viewershipPausedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Indexes
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ title: 'text', description: 'text' });
propertySchema.index({ sellerId: 1 });
propertySchema.index({ status: 1, type: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ listingType: 1, status: 1, price: 1 });
propertySchema.index({ 'location.city': 1, listingType: 1 });

// Generate slug before saving
propertySchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
