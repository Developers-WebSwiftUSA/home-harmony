import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'buyer', 'seller', 'agent'],
    required: [true, 'Please specify a role']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  // Profile fields
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    distanceUnit: {
      type: String,
      enum: ['miles', 'km'],
      default: 'miles'
    }
  },
  // Role-specific profiles
  buyerProfile: {
    preferences: {
      propertyTypes: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      locations: [String],
      amenities: [String]
    },
    savedSearches: [{
      name: String,
      filters: mongoose.Schema.Types.Mixed,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  sellerProfile: {
    companyName: String,
    licenseNumber: String,
    bio: String
  },
  agentProfile: {
    licenseNumber: {
      type: String,
      trim: true
    },
    specialization: [String],
    yearsOfExperience: Number,
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    verified: {
      type: Boolean,
      default: false
    },
    bio: String,
    languages: [String]
  },
  // Common fields
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
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

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

const User = mongoose.model('User', userSchema);

export default User;
