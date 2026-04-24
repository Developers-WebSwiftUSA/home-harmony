import asyncHandler from '../middleware/asyncHandler.js';
import Property from '../models/Property.model.js';
import PropertyView from '../models/PropertyView.model.js';
import Notification from '../models/Notification.model.js';

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getProperties = asyncHandler(async (req, res) => {
  const {
    type,
    status = 'active',
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    city,
    state,
    search,
    featured,
    page = 1,
    limit = 12,
    sort = '-createdAt'
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
  if (bathrooms) query.bathrooms = { $gte: parseInt(bathrooms) };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (state) query['location.state'] = { $regex: state, $options: 'i' };
  if (featured) query.featured = featured === 'true';
  if (search) {
    query.$text = { $search: search };
  }

  const properties = await Property.find(query)
    .populate('sellerId', 'firstName lastName email phone avatar')
    .populate('agentId', 'firstName lastName email phone avatar')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sort);

  const total = await Property.countDocuments(query);

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: properties
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('sellerId', 'firstName lastName email phone avatar')
    .populate('agentId', 'firstName lastName email phone avatar agentProfile');

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Track view
  if (req.user) {
    await PropertyView.create({
      propertyId: property._id,
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
  } else {
    await PropertyView.create({
      propertyId: property._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
  }

  property.views += 1;
  await property.save();

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Create property
// @route   POST /api/properties
// @access  Private/Seller
export const createProperty = asyncHandler(async (req, res) => {
  req.body.sellerId = req.user.id;

  const property = await Property.create(req.body);

  // Notify admin for approval
  await Notification.create({
    userId: req.user.id,
    type: 'property_approved',
    title: 'New Property Listing',
    message: `Property "${property.title}" has been submitted for review`,
    relatedId: property._id,
    relatedModel: 'Property'
  });

  res.status(201).json({
    success: true,
    data: property
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
export const updateProperty = asyncHandler(async (req, res) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check ownership or admin
  if (property.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this property'
    });
  }

  property = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check ownership or admin
  if (property.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this property'
    });
  }

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Property deleted successfully'
  });
});

// @desc    Approve property (Admin)
// @route   PUT /api/properties/:id/approve
// @access  Private/Admin
export const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  property.status = 'active';
  property.approvedBy = req.user.id;
  property.approvedAt = new Date();
  property.publishedAt = new Date();
  await property.save();

  // Notify seller
  await Notification.create({
    userId: property.sellerId,
    type: 'property_approved',
    title: 'Property Approved',
    message: `Your property "${property.title}" has been approved and is now live`,
    relatedId: property._id,
    relatedModel: 'Property'
  });

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Reject property (Admin)
// @route   PUT /api/properties/:id/reject
// @access  Private/Admin
export const rejectProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  property.status = 'rejected';
  await property.save();

  // Notify seller
  await Notification.create({
    userId: property.sellerId,
    type: 'property_rejected',
    title: 'Property Rejected',
    message: `Your property "${property.title}" has been rejected. Please review and resubmit.`,
    relatedId: property._id,
    relatedModel: 'Property'
  });

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Search properties by location (geospatial)
// @route   GET /api/properties/search/nearby
// @access  Public
export const searchNearby = asyncHandler(async (req, res) => {
  const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters

  if (!longitude || !latitude) {
    return res.status(400).json({
      success: false,
      message: 'Please provide longitude and latitude'
    });
  }

  const properties = await Property.find({
    status: 'active',
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseInt(maxDistance)
      }
    }
  })
    .populate('sellerId', 'firstName lastName email phone avatar')
    .limit(20);

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// @desc    Get properties for current seller
// @route   GET /api/properties/mine
// @access  Private/Seller
export const getMyProperties = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { sellerId: req.user.id };

  const properties = await Property.find(query)
    .populate("sellerId", "firstName lastName email phone avatar")
    .populate("agentId", "firstName lastName email phone avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// @desc    Get properties assigned to current agent
// @route   GET /api/properties/agent
// @access  Private/Agent
export const getAgentProperties = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { agentId: req.user.id };

  const properties = await Property.find(query)
    .populate("sellerId", "firstName lastName email phone avatar")
    .populate("agentId", "firstName lastName email phone avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});
