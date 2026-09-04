import asyncHandler from '../middleware/asyncHandler.js';
import Property from '../models/Property.model.js';
import PropertyView from '../models/PropertyView.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import { expireAdCampaigns } from '../utils/adCampaignLifecycle.js';
import { emitPendingActionsUpdated } from '../utils/emitPendingActions.js';
import {
  applyMapBoundsSearch,
  applyMapRadiusSearch,
  ensurePropertyCoordinates,
} from '../utils/propertyLocation.js';

const EARTH_RADIUS_MILES = 3963.2;

const buildRadiusFilter = (longitude, latitude, radiusMiles) => ({
  $geoWithin: {
    $centerSphere: [
      [parseFloat(longitude), parseFloat(latitude)],
      parseFloat(radiusMiles) / EARTH_RADIUS_MILES
    ]
  }
});

const buildLocationSearchFilter = (term) => {
  const regex = { $regex: term, $options: 'i' };
  return {
    $or: [
      { title: regex },
      { description: regex },
      { 'location.city': regex },
      { 'location.state': regex },
      { 'location.zipCode': regex },
      { 'location.address': regex }
    ]
  };
};

const publicViewershipFilter = { viewershipEnabled: { $ne: false } };

const canManageProperty = (property, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (property.sellerId?.toString() === user.id) return true;
  if (property.agentId?.toString() === user.id) return true;
  return false;
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getProperties = asyncHandler(async (req, res) => {
  await expireAdCampaigns();

  const {
    type,
    status = 'active',
    listingType,
    minPrice,
    maxPrice,
    minSqft,
    maxSqft,
    bedrooms,
    bathrooms,
    city,
    state,
    zipCode,
    search,
    featured,
    agentId,
    petsAllowed,
    furnished,
    laundry,
    parking,
    moveInDate,
    acceptsApplications,
    amenities,
    minRating,
    swLng,
    swLat,
    neLng,
    neLat,
    latitude,
    longitude,
    radiusMiles,
    page = 1,
    limit = 12,
    sort = '-createdAt'
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;

  Object.assign(query, publicViewershipFilter);

  if (listingType) {
    if (listingType === 'rent') {
      query.listingType = { $in: ['rent', 'both'] };
    } else if (listingType === 'sale') {
      query.listingType = { $in: ['sale', 'both'] };
    } else {
      query.listingType = listingType;
    }
  }

  if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms, 10) };
  if (bathrooms) query.bathrooms = { $gte: parseInt(bathrooms, 10) };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice, 10);
    if (maxPrice) query.price.$lte = parseInt(maxPrice, 10);
  }

  if (minSqft || maxSqft) {
    query.squareFeet = {};
    if (minSqft) query.squareFeet.$gte = parseInt(minSqft, 10);
    if (maxSqft) query.squareFeet.$lte = parseInt(maxSqft, 10);
  }

  if (featured) query.featured = featured === 'true';
  if (agentId) query.agentId = agentId;

  const locationClauses = [];

  if (search) {
    locationClauses.push(buildLocationSearchFilter(String(search)));
  } else if (city) {
    locationClauses.push(buildLocationSearchFilter(String(city)));
  }

  if (state) {
    locationClauses.push({ 'location.state': { $regex: state, $options: 'i' } });
  }

  if (zipCode) {
    locationClauses.push({ 'location.zipCode': { $regex: zipCode, $options: 'i' } });
  }

  if (locationClauses.length === 1) {
    Object.assign(query, locationClauses[0]);
  } else if (locationClauses.length > 1) {
    query.$and = [...(query.$and || []), ...locationClauses];
  }

  if (petsAllowed === 'true') {
    query['rentalDetails.petPolicy'] = { $in: ['allowed', 'negotiable'] };
  } else if (petsAllowed === 'false') {
    query['rentalDetails.petPolicy'] = 'not_allowed';
  }

  if (furnished === 'true') query['rentalDetails.furnished'] = true;
  if (laundry && laundry !== 'any') query['rentalDetails.laundry'] = laundry;
  if (parking === 'true') query['features.parking'] = true;
  if (acceptsApplications === 'true') query['rentalDetails.acceptsApplications'] = true;
  if (moveInDate) {
    query.availabilityDate = { $lte: new Date(moveInDate) };
  }

  if (amenities) {
    const amenityList = String(amenities).split(',').map((a) => a.trim()).filter(Boolean);
    if (amenityList.length) query.amenities = { $all: amenityList };
  }

  if (minRating) {
    query['rating.average'] = { $gte: parseFloat(minRating) };
  }

  const hasRadiusGeo =
    latitude != null &&
    latitude !== '' &&
    longitude != null &&
    longitude !== '' &&
    radiusMiles != null &&
    radiusMiles !== '' &&
    Number(radiusMiles) > 0;

  const hasBoundsGeo =
    swLng != null &&
    swLng !== '' &&
    swLat != null &&
    swLat !== '' &&
    neLng != null &&
    neLng !== '' &&
    neLat != null &&
    neLat !== '' &&
    !hasRadiusGeo;

  if (hasRadiusGeo) {
    await applyMapRadiusSearch(query, {
      longitude,
      latitude,
      radiusMiles,
      buildRadiusFilter,
    });
  } else if (hasBoundsGeo) {
    await applyMapBoundsSearch(query, { swLng, swLat, neLng, neLat });
  }

  const parsedLimit = Math.min(parseInt(limit, 10) || 12, 500);
  const parsedPage = parseInt(page, 10) || 1;

  let sortOption = sort;
  if (sort === 'price') sortOption = 'price';
  else if (sort === '-price') sortOption = '-price';
  else if (sort === 'relevance' && search) sortOption = { score: { $meta: 'textScore' } };
  else if (sort === 'relevance') sortOption = { promotionPriority: -1, createdAt: -1 };
  else if (sort === '-createdAt' || sort === 'createdAt') {
    sortOption = { promotionPriority: -1, createdAt: sort === '-createdAt' ? -1 : 1 };
  } else if (!sort || sort === 'promoted') {
    sortOption = { promotionPriority: -1, createdAt: -1 };
  }

  const properties = await Property.find(query)
    .populate('sellerId', 'firstName lastName email phone avatar')
    .populate('agentId', 'firstName lastName email phone avatar')
    .limit(parsedLimit)
    .skip((parsedPage - 1) * parsedLimit)
    .sort(sortOption);

  const total = await Property.countDocuments(query);

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    page: parsedPage,
    pages: Math.ceil(total / parsedLimit),
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

  if (property.viewershipEnabled === false && !canManageProperty(property, req.user)) {
    return res.status(404).json({
      success: false,
      message: 'This property is not available for viewing'
    });
  }

  // Track view for publicly visible listings only
  if (property.viewershipEnabled !== false) {
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
  }

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
  delete req.body.approvedBy;
  delete req.body.approvedAt;

  // Sellers cannot publish live — new listings always wait for admin approval.
  if (req.user.role !== 'admin') {
    req.body.status = 'pending';
  } else if (!req.body.status) {
    req.body.status = 'pending';
  }

  if (req.body.location) {
    req.body.location = await ensurePropertyCoordinates(req.body.location);
  }

  const property = await Property.create(req.body);

  const io = req.app.get('io');
  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      Notification.create({
        userId: admin._id,
        type: 'system_announcement',
        title: 'Listing pending approval',
        message: `"${property.title}" was submitted and needs review.`,
        relatedId: property._id,
        relatedModel: 'Property',
        actionUrl: `/admin/properties/${property._id}`,
      }).then((notification) => {
        if (io) {
          io.to(`user-${admin._id}`).emit('notification', notification);
          emitPendingActionsUpdated(io, admin._id);
        }
      })
    )
  );

  await Notification.create({
    userId: req.user.id,
    type: 'system_announcement',
    title: 'Listing submitted',
    message: `"${property.title}" was sent for admin approval and is not live yet.`,
    relatedId: property._id,
    relatedModel: 'Property',
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

  if (req.user.role !== 'admin') {
    delete req.body.status;
    delete req.body.approvedBy;
    delete req.body.approvedAt;
    delete req.body.featured;
    delete req.body.promotion;
    delete req.body.promotionPriority;
    if (property.status === 'rejected') {
      req.body.status = 'pending';
    }
  }

  if (req.body.location) {
    req.body.location = await ensurePropertyCoordinates(req.body.location);
  }

  property = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('sellerId', 'firstName lastName email phone avatar')
    .populate('agentId', 'firstName lastName email phone avatar');

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Enable or pause public viewership for a property
// @route   PUT /api/properties/:id/viewership
// @access  Private (assigned agent, seller, or admin)
export const setPropertyViewership = asyncHandler(async (req, res) => {
  const enabled = req.body.enabled;
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Please provide enabled as true or false'
    });
  }

  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  if (!canManageProperty(property, req.user)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to control viewership for this property'
    });
  }

  if (property.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Viewership can only be changed for active listings'
    });
  }

  property.viewershipEnabled = enabled;
  property.viewershipPausedAt = enabled ? null : new Date();
  property.viewershipPausedBy = enabled ? null : req.user.id;
  await property.save();

  const populated = await Property.findById(property._id)
    .populate('sellerId', 'firstName lastName email phone avatar')
    .populate('agentId', 'firstName lastName email phone avatar')
    .populate('viewershipPausedBy', 'firstName lastName email role');

  res.status(200).json({
    success: true,
    data: populated,
    message: enabled ? 'Property is visible to the public again' : 'Public viewership paused'
  });
});

// @desc    Assign agent to property
// @route   PUT /api/properties/:id/assign-agent
// @access  Private/Seller or Admin
export const assignAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  if (property.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to assign an agent to this property'
    });
  }

  let nextAgentId = null;
  if (agentId && agentId !== 'none' && agentId !== '') {
    const agent = await User.findOne({
      _id: agentId,
      role: 'agent',
      status: 'active'
    });

    if (!agent) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent. Choose an active agent account.'
      });
    }
    nextAgentId = agent._id;
  }

  const previousAgentId = property.agentId?.toString();
  property.agentId = nextAgentId;
  await property.save();

  if (nextAgentId && previousAgentId !== nextAgentId.toString()) {
    await Notification.create({
      userId: nextAgentId,
      type: 'property_assigned',
      title: 'Property Assigned',
      message: `You have been assigned to manage "${property.title}"`,
      relatedId: property._id,
      relatedModel: 'Property',
      actionUrl: '/agent'
    });
  }

  const updated = await Property.findById(property._id)
    .populate('sellerId', 'firstName lastName email phone avatar')
    .populate('agentId', 'firstName lastName email phone avatar');

  res.status(200).json({
    success: true,
    data: updated
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

  emitPendingActionsUpdated(req.app.get('io'), req.user.id, property.sellerId);

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

  emitPendingActionsUpdated(req.app.get('io'), req.user.id, property.sellerId);

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Search properties by location (geospatial)
// @route   GET /api/properties/search/nearby
// @access  Public
export const searchNearby = asyncHandler(async (req, res) => {
  const { longitude, latitude, maxDistance = 10000, listingType } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({
      success: false,
      message: 'Please provide longitude and latitude'
    });
  }

  const radiusMiles = parseInt(maxDistance, 10) / 1609.344;
  const query = {
    status: 'active',
    ...publicViewershipFilter,
    'location.coordinates': buildRadiusFilter(longitude, latitude, radiusMiles)
  };

  if (listingType === 'rent') {
    query.listingType = { $in: ['rent', 'both'] };
  } else if (listingType === 'sale') {
    query.listingType = { $in: ['sale', 'both'] };
  }

  const properties = await Property.find(query)
    .populate('sellerId', 'firstName lastName email phone avatar')
    .limit(20);

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// @desc    Location suggestions for rental/property search
// @route   GET /api/properties/locations/suggest
// @access  Public
export const suggestLocations = asyncHandler(async (req, res) => {
  const { q = '', listingType } = req.query;
  const term = String(q).trim();
  if (!term || term.length < 2) {
    return res.status(200).json({ success: true, data: [] });
  }

  const match = {
    status: 'active',
    ...publicViewershipFilter,
    $or: [
      { 'location.city': { $regex: term, $options: 'i' } },
      { 'location.state': { $regex: term, $options: 'i' } },
      { 'location.zipCode': { $regex: term, $options: 'i' } },
      { 'location.address': { $regex: term, $options: 'i' } }
    ]
  };

  if (listingType === 'rent') {
    match.listingType = { $in: ['rent', 'both'] };
  } else if (listingType === 'sale') {
    match.listingType = { $in: ['sale', 'both'] };
  }

  const properties = await Property.find(match)
    .select('location.city location.state location.zipCode location.address')
    .limit(40);

  const seen = new Set();
  const suggestions = [];

  for (const property of properties) {
    const city = property.location?.city;
    const state = property.location?.state;
    const zip = property.location?.zipCode;
    const address = property.location?.address;

    const candidates = [
      city && state ? `${city}, ${state}` : null,
      zip ? `${zip}${city ? ` · ${city}` : ''}` : null,
      address && city ? `${address}, ${city}` : address
    ].filter(Boolean);

    for (const label of candidates) {
      const key = label.toLowerCase();
      if (!seen.has(key) && label.toLowerCase().includes(term.toLowerCase())) {
        seen.add(key);
        suggestions.push({ label, city, state, zipCode: zip });
      }
      if (suggestions.length >= 8) break;
    }
    if (suggestions.length >= 8) break;
  }

  res.status(200).json({ success: true, data: suggestions });
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
