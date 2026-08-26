import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Tour from '../models/Tour.model.js';
import RentalApplication from '../models/RentalApplication.model.js';
import Conversation from '../models/Conversation.model.js';
import Property from '../models/Property.model.js';
import User from '../models/User.model.js';

const isRentalProperty = (listingType) =>
  listingType === 'rent' || listingType === 'both';

const isSaleProperty = (listingType) =>
  listingType === 'sale' || listingType === 'both';

const marketMatchesProperty = (market, listingType) => {
  if (market === 'rent') return isRentalProperty(listingType);
  return isSaleProperty(listingType);
};

const getOwnerFilter = (user) => {
  if (user.role === 'seller') return { sellerId: user.id };
  if (user.role === 'agent') return { agentId: user.id };
  return {};
};

const formatBuyerSummary = (entry) => ({
  buyerId: entry.buyer._id,
  buyer: entry.buyer,
  market: entry.market,
  toursCount: entry.tours.length,
  applicationsCount: entry.applications.length,
  propertiesCount: entry.properties.length,
  reviewsCount: entry.reviews.length,
  closedDeals: entry.closedDeals,
  lastActivity: entry.lastActivity,
  status: entry.status
});

const buildBuyerMap = async (user, market) => {
  const ownerFilter = getOwnerFilter(user);
  const buyerMap = new Map();

  const ensureBuyer = (buyer, sourceDate) => {
    if (!buyer?._id) return null;
    const id = buyer._id.toString();
    if (!buyerMap.has(id)) {
      buyerMap.set(id, {
        buyer,
        market,
        tours: [],
        applications: [],
        properties: [],
        reviews: [],
        closedDeals: 0,
        lastActivity: sourceDate || null,
        status: 'active'
      });
    }
    const entry = buyerMap.get(id);
    if (sourceDate && (!entry.lastActivity || sourceDate > entry.lastActivity)) {
      entry.lastActivity = sourceDate;
    }
    return entry;
  };

  const ownedProperties = await Property.find({
    ...(user.role === 'seller' ? { sellerId: user.id } : { agentId: user.id })
  }).select('_id title listingType status price location images');

  const ownedIds = ownedProperties.map((p) => p._id);
  const ownedById = new Map(ownedProperties.map((p) => [p._id.toString(), p]));

  const tours = await Tour.find({
    ...ownerFilter,
    propertyId: { $in: ownedIds }
  })
    .populate('buyerId', 'firstName lastName email phone avatar role')
    .populate('propertyId', 'title listingType status price location');

  tours.forEach((tour) => {
    const property = tour.propertyId;
    if (!property || !marketMatchesProperty(market, property.listingType)) return;
    const entry = ensureBuyer(tour.buyerId, tour.updatedAt || tour.createdAt);
    if (!entry) return;
    entry.tours.push(tour);
    entry.properties.push(property);
    if (property.status === 'sold' || property.status === 'rented') entry.closedDeals += 1;
    if (tour.feedback?.submittedAt) {
      entry.reviews.push({
        tourId: tour._id,
        property: property,
        rating: tour.feedback.propertyRating,
        comment: tour.feedback.propertyComment,
        submittedAt: tour.feedback.submittedAt,
        overallExperience: tour.feedback.overallExperience
      });
    }
  });

  if (market === 'rent') {
    const applications = await RentalApplication.find(ownerFilter)
      .populate('buyerId', 'firstName lastName email phone avatar role')
      .populate('propertyId', 'title listingType status price location');

    applications.forEach((app) => {
      const entry = ensureBuyer(app.buyerId, app.updatedAt || app.createdAt);
      if (!entry) return;
      entry.applications.push(app);
      if (app.propertyId) entry.properties.push(app.propertyId);
      if (app.status === 'approved') entry.closedDeals += 1;
      if (app.status === 'rejected' || app.status === 'withdrawn') entry.status = app.status;
    });
  }

  const conversations = await Conversation.find({
    participants: user.id,
    propertyId: { $in: ownedIds }
  })
    .populate('participants', 'firstName lastName email phone avatar role')
    .populate('propertyId', 'title listingType status price location');

  conversations.forEach((conv) => {
    const property = conv.propertyId;
    if (!property || !marketMatchesProperty(market, property.listingType)) return;
    const other = conv.participants.find((p) => p._id.toString() !== user.id && p.role === 'buyer');
    if (!other) return;
    const entry = ensureBuyer(other, conv.lastMessageAt || conv.updatedAt);
    if (!entry) return;
    entry.properties.push(property);
  });

  buyerMap.forEach((entry) => {
    const uniqueProps = new Map();
    entry.properties.forEach((p) => {
      if (p?._id) uniqueProps.set(p._id.toString(), p);
    });
    entry.properties = Array.from(uniqueProps.values());
  });

  return Array.from(buyerMap.values()).map(formatBuyerSummary);
};

// @desc    List buyers for seller/agent
// @route   GET /api/crm/my-buyers
export const getMyBuyers = asyncHandler(async (req, res) => {
  const { market = 'sale' } = req.query;
  if (!['sale', 'rent'].includes(market)) {
    return res.status(400).json({ success: false, message: 'Invalid market' });
  }
  if (!['seller', 'agent'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const buyers = await buildBuyerMap(req.user, market);
  res.status(200).json({ success: true, count: buyers.length, data: buyers });
});

// @desc    Buyer detail for seller/agent
// @route   GET /api/crm/my-buyers/:buyerId
export const getMyBuyerDetail = asyncHandler(async (req, res) => {
  const { market = 'sale' } = req.query;
  const buyers = await buildBuyerMap(req.user, market);
  const detail = buyers.find((b) => b.buyerId.toString() === req.params.buyerId);

  if (!detail) {
    return res.status(404).json({ success: false, message: 'Buyer not found' });
  }

  const ownerFilter = getOwnerFilter(req.user);
  const [tours, applications] = await Promise.all([
    Tour.find({ ...ownerFilter, buyerId: req.params.buyerId })
      .populate('propertyId', 'title listingType status price location images')
      .sort({ date: -1 }),
    market === 'rent'
      ? RentalApplication.find({ ...ownerFilter, buyerId: req.params.buyerId })
          .populate('propertyId', 'title listingType status price location images')
          .sort({ createdAt: -1 })
      : []
  ]);

  const filteredTours = tours.filter((t) =>
    t.propertyId && marketMatchesProperty(market, t.propertyId.listingType)
  );

  res.status(200).json({
    success: true,
    data: {
      ...detail,
      tours: filteredTours,
      applications,
      reviews: filteredTours
        .filter((t) => t.feedback?.propertyRating)
        .map((t) => ({
          tourId: t._id,
          property: t.propertyId,
          rating: t.feedback.propertyRating,
          comment: t.feedback.propertyComment,
          submittedAt: t.feedback.submittedAt,
          overallExperience: t.feedback.overallExperience
        }))
    }
  });
});

// @desc    List sellers/agents for admin
// @route   GET /api/crm/partners
export const getPartners = asyncHandler(async (req, res) => {
  const { role = 'seller' } = req.query;
  if (!['seller', 'agent'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const partners = await User.find({ role }).select(
    'firstName lastName email phone avatar role status createdAt agentProfile'
  );

  const enriched = await Promise.all(
    partners.map(async (partner) => {
      const propertyFilter =
        role === 'seller' ? { sellerId: partner._id } : { agentId: partner._id };
      const properties = await Property.find(propertyFilter).select('listingType status');
      const saleBuyers = await buildBuyerMap({ id: partner._id.toString(), role }, 'sale');
      const rentBuyers = await buildBuyerMap({ id: partner._id.toString(), role }, 'rent');

      return {
        partner,
        stats: {
          listings: properties.length,
          saleListings: properties.filter((p) => isSaleProperty(p.listingType)).length,
          rentListings: properties.filter((p) => isRentalProperty(p.listingType)).length,
          activeListings: properties.filter((p) => p.status === 'active').length,
          saleBuyers: saleBuyers.length,
          rentBuyers: rentBuyers.length
        }
      };
    })
  );

  res.status(200).json({ success: true, count: enriched.length, data: enriched });
});

// @desc    Partner detail for admin
// @route   GET /api/crm/partners/:id
export const getPartnerDetail = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const partner = await User.findById(req.params.id).select(
    'firstName lastName email phone avatar role status createdAt agentProfile location'
  );
  if (!partner || !['seller', 'agent'].includes(partner.role)) {
    return res.status(404).json({ success: false, message: 'Partner not found' });
  }

  const propertyFilter =
    partner.role === 'seller' ? { sellerId: partner._id } : { agentId: partner._id };
  const properties = await Property.find(propertyFilter)
    .populate('sellerId', 'firstName lastName email')
    .populate('agentId', 'firstName lastName email')
    .sort({ createdAt: -1 });

  const saleBuyers = await buildBuyerMap(
    { id: partner._id.toString(), role: partner.role },
    'sale'
  );
  const rentBuyers = await buildBuyerMap(
    { id: partner._id.toString(), role: partner.role },
    'rent'
  );

  res.status(200).json({
    success: true,
    data: {
      partner,
      properties,
      saleBuyers,
      rentBuyers
    }
  });
});

// @desc    Admin view buyer under a partner
// @route   GET /api/crm/partners/:partnerId/buyers/:buyerId
export const getPartnerBuyerDetail = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const partner = await User.findById(req.params.partnerId);
  if (!partner || !['seller', 'agent'].includes(partner.role)) {
    return res.status(404).json({ success: false, message: 'Partner not found' });
  }

  const { market = 'sale' } = req.query;
  const buyers = await buildBuyerMap(
    { id: partner._id.toString(), role: partner.role },
    market
  );
  const summary = buyers.find((b) => b.buyerId.toString() === req.params.buyerId);
  if (!summary) {
    return res.status(404).json({ success: false, message: 'Buyer not found for this partner' });
  }

  const ownerFilter =
    partner.role === 'seller'
      ? { sellerId: partner._id }
      : { agentId: partner._id };

  const [tours, applications] = await Promise.all([
    Tour.find({ ...ownerFilter, buyerId: req.params.buyerId })
      .populate('propertyId', 'title listingType status price location images')
      .sort({ date: -1 }),
    market === 'rent'
      ? RentalApplication.find({ ...ownerFilter, buyerId: req.params.buyerId })
          .populate('propertyId', 'title listingType status price location images')
          .sort({ createdAt: -1 })
      : []
  ]);

  const filteredTours = tours.filter((t) =>
    t.propertyId && marketMatchesProperty(market, t.propertyId.listingType)
  );

  res.status(200).json({
    success: true,
    data: {
      partner,
      buyer: summary,
      tours: filteredTours,
      applications,
      reviews: filteredTours
        .filter((t) => t.feedback?.propertyRating)
        .map((t) => ({
          tourId: t._id,
          property: t.propertyId,
          rating: t.feedback.propertyRating,
          comment: t.feedback.propertyComment,
          submittedAt: t.feedback.submittedAt
        }))
    }
  });
});
