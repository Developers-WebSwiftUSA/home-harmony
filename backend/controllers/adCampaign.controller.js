import asyncHandler from '../middleware/asyncHandler.js';
import AdCampaign from '../models/AdCampaign.model.js';
import Property from '../models/Property.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import {
  AD_DURATIONS,
  AD_TYPES,
  calculateTotalAmount,
  getDailyRate,
  getPricingCatalog,
} from '../utils/adPricing.js';
import {
  applyCampaignToProperty,
  clearPropertyPromotion,
  expireAdCampaigns,
} from '../utils/adCampaignLifecycle.js';

const populateCampaign = (query) =>
  query
    .populate('propertyId', 'title location images price listingType status type bedrooms bathrooms')
    .populate('requesterId', 'firstName lastName email role')
    .populate('approvedBy', 'firstName lastName email')
    .populate('rejectedBy', 'firstName lastName email');

const canAccessCampaign = (campaign, user) => {
  if (user.role === 'admin') return true;
  return campaign.requesterId?._id?.toString() === user.id || campaign.requesterId?.toString() === user.id;
};

const canManagePropertyAds = (property, user) => {
  if (user.role === 'admin') return true;
  if (user.role === 'seller') return property.sellerId?.toString() === user.id;
  if (user.role === 'agent') return property.agentId?.toString() === user.id;
  return false;
};

const maskCardNumber = (cardNumber = '') => {
  const digits = String(cardNumber).replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    const error = new Error('Please provide a valid card number (13–19 digits)');
    error.statusCode = 400;
    throw error;
  }
  return digits.slice(-4);
};

const detectCardBrand = (cardNumber = '') => {
  const digits = String(cardNumber).replace(/\D/g, '');
  if (digits.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(digits)) return 'mastercard';
  if (digits.startsWith('3')) return 'amex';
  return 'card';
};

const mockChargePayment = async (campaign) => {
  if (!campaign.payment?.cardLast4) {
    throw new Error('Payment details are missing');
  }
  return {
    paymentStatus: 'charged',
    chargedAmount: campaign.totalAmount,
    chargedAt: new Date(),
  };
};

const notifyUser = async (io, userId, payload) => {
  if (!userId) return;
  await Notification.create({
    userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    actionUrl: payload.actionUrl,
    relatedId: payload.relatedId,
    relatedModel: payload.relatedModel,
  });
  if (io) {
    io.to(`user-${userId}`).emit('notification', payload);
  }
};

// @desc    Get ad pricing catalog
// @route   GET /api/ad-campaigns/pricing
// @access  Private (seller, agent, admin)
export const getAdPricing = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: getPricingCatalog() });
});

// @desc    List ad campaigns
// @route   GET /api/ad-campaigns
// @access  Private
export const getAdCampaigns = asyncHandler(async (req, res) => {
  await expireAdCampaigns();

  if (!['admin', 'seller', 'agent'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const { status, propertyId, page = 1, limit = 20 } = req.query;
  const query = {};

  // Sellers and agents only see their own requests; admins see all.
  if (req.user.role === 'seller' || req.user.role === 'agent') {
    query.requesterId = req.user.id;
  }

  if (status) query.status = status;
  if (propertyId) query.propertyId = propertyId;

  const campaigns = await populateCampaign(
    AdCampaign.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
  );

  const total = await AdCampaign.countDocuments(query);

  let statusCounts;
  if (req.user.role === 'admin') {
    const [grouped, charged] = await Promise.all([
      AdCampaign.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      AdCampaign.aggregate([
        { $match: { paymentStatus: 'charged' } },
        { $group: { _id: null, total: { $sum: '$chargedAmount' }, count: { $sum: 1 } } },
      ]),
    ]);
    statusCounts = grouped.reduce((acc, row) => {
      if (row._id) acc[row._id] = row.count;
      return acc;
    }, {});
    statusCounts.all = grouped.reduce((sum, row) => sum + row.count, 0);
    statusCounts.pending = statusCounts.pending || 0;
    statusCounts.active = statusCounts.active || 0;
    statusCounts.revenue = charged[0]?.total || 0;
    statusCounts.payments = charged[0]?.count || 0;
  }

  res.status(200).json({
    success: true,
    count: campaigns.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    ...(statusCounts && { statusCounts }),
    data: campaigns,
  });
});

// @desc    Get ad campaign
// @route   GET /api/ad-campaigns/:id
// @access  Private
export const getAdCampaign = asyncHandler(async (req, res) => {
  await expireAdCampaigns();

  const campaign = await populateCampaign(AdCampaign.findById(req.params.id));

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Ad campaign not found' });
  }

  if (!canAccessCampaign(campaign, req.user)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, data: campaign });
});

// @desc    Create ad campaign request
// @route   POST /api/ad-campaigns
// @access  Private (seller, agent)
export const createAdCampaign = asyncHandler(async (req, res) => {
  const {
    propertyId,
    adType,
    durationDays,
    cardHolderName,
    cardNumber,
    billingEmail,
    billingAddress,
  } = req.body;

  if (!propertyId || !cardHolderName || !cardNumber || !billingEmail) {
    return res.status(400).json({
      success: false,
      message: 'Property, cardholder name, card number, and billing email are required',
    });
  }

  if (!AD_TYPES.includes(adType)) {
    return res.status(400).json({ success: false, message: 'Invalid ad type' });
  }

  if (!AD_DURATIONS.includes(Number(durationDays))) {
    return res.status(400).json({ success: false, message: 'Invalid campaign duration' });
  }

  let cardLast4;
  let cardBrand;
  try {
    cardLast4 = maskCardNumber(cardNumber);
    cardBrand = detectCardBrand(cardNumber);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Please provide a valid card number',
    });
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  if (property.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Only active listings can be promoted' });
  }

  if (!canManagePropertyAds(property, req.user)) {
    return res.status(403).json({ success: false, message: 'Not authorized for this property' });
  }

  const existingPending = await AdCampaign.findOne({
    propertyId,
    status: { $in: ['pending', 'active'] },
  });

  if (existingPending) {
    return res.status(400).json({
      success: false,
      message: 'This property already has a pending or active promotion request',
    });
  }

  const dailyRate = getDailyRate(adType);
  const totalAmount = calculateTotalAmount(adType, durationDays);

  const campaign = await AdCampaign.create({
    propertyId,
    requesterId: req.user.id,
    requesterRole: req.user.role,
    adType,
    durationDays: Number(durationDays),
    dailyRate,
    totalAmount,
    payment: {
      cardHolderName: String(cardHolderName).trim(),
      cardLast4,
      cardBrand,
      billingEmail: String(billingEmail).trim(),
      billingAddress: billingAddress ? String(billingAddress).trim() : undefined,
    },
    status: 'pending',
    paymentStatus: 'pending',
  });

  const populated = await populateCampaign(AdCampaign.findById(campaign._id));

  const io = req.app.get('io');
  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notifyUser(io, admin._id, {
        type: 'ad_campaign_request',
        title: 'New promotion request',
        message: `${req.user.firstName || 'A partner'} submitted a ${adType} request for ${property.title}.`,
        actionUrl: '/admin/ad-campaigns',
        relatedId: campaign._id,
        relatedModel: 'AdCampaign',
      })
    )
  );

  res.status(201).json({ success: true, data: populated });
});

// @desc    Cancel pending ad campaign
// @route   PUT /api/ad-campaigns/:id/cancel
// @access  Private (requester, admin)
export const cancelAdCampaign = asyncHandler(async (req, res) => {
  const campaign = await AdCampaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Ad campaign not found' });
  }

  if (!canAccessCampaign(campaign, req.user)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (campaign.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
  }

  campaign.status = 'cancelled';
  campaign.cancelledAt = new Date();
  await campaign.save();

  const populated = await populateCampaign(AdCampaign.findById(campaign._id));
  res.status(200).json({ success: true, data: populated });
});

// @desc    Approve ad campaign and charge payment
// @route   PUT /api/ad-campaigns/:id/approve
// @access  Private (admin)
export const approveAdCampaign = asyncHandler(async (req, res) => {
  const { adminNotes } = req.body;
  const campaign = await AdCampaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Ad campaign not found' });
  }

  if (campaign.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be approved' });
  }

  const property = await Property.findById(campaign.propertyId);
  if (!property || property.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Property is not eligible for promotion' });
  }

  const charge = await mockChargePayment(campaign);
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + campaign.durationDays);

  campaign.status = 'active';
  campaign.paymentStatus = charge.paymentStatus;
  campaign.chargedAmount = charge.chargedAmount;
  campaign.chargedAt = charge.chargedAt;
  campaign.startDate = startDate;
  campaign.endDate = endDate;
  campaign.approvedBy = req.user.id;
  campaign.approvedAt = new Date();
  if (adminNotes) campaign.adminNotes = String(adminNotes).trim();
  await campaign.save();

  await applyCampaignToProperty(campaign);

  const populated = await populateCampaign(AdCampaign.findById(campaign._id));

  const io = req.app.get('io');
  await notifyUser(io, campaign.requesterId, {
    type: 'ad_campaign_approved',
    title: 'Promotion approved',
    message: `Your ${campaign.adType} campaign for ${property.title} is now live.`,
    actionUrl: campaign.requesterRole === 'agent' ? '/agent/promotions' : '/seller/promotions',
    relatedId: campaign._id,
    relatedModel: 'AdCampaign',
  });

  res.status(200).json({ success: true, data: populated });
});

// @desc    Reject ad campaign request
// @route   PUT /api/ad-campaigns/:id/reject
// @access  Private (admin)
export const rejectAdCampaign = asyncHandler(async (req, res) => {
  const { rejectionReason, adminNotes } = req.body;
  const campaign = await AdCampaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Ad campaign not found' });
  }

  if (campaign.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be rejected' });
  }

  campaign.status = 'rejected';
  campaign.paymentStatus = 'pending';
  campaign.rejectedBy = req.user.id;
  campaign.rejectedAt = new Date();
  campaign.rejectionReason = rejectionReason ? String(rejectionReason).trim() : 'Request rejected by admin';
  if (adminNotes) campaign.adminNotes = String(adminNotes).trim();
  await campaign.save();

  const populated = await populateCampaign(AdCampaign.findById(campaign._id));

  const io = req.app.get('io');
  await notifyUser(io, campaign.requesterId, {
    type: 'ad_campaign_rejected',
    title: 'Promotion request declined',
    message: campaign.rejectionReason,
    actionUrl: campaign.requesterRole === 'agent' ? '/agent/promotions' : '/seller/promotions',
    relatedId: campaign._id,
    relatedModel: 'AdCampaign',
  });

  res.status(200).json({ success: true, data: populated });
});

// @desc    End active campaign early
// @route   PUT /api/ad-campaigns/:id/end
// @access  Private (admin)
export const endAdCampaign = asyncHandler(async (req, res) => {
  const campaign = await AdCampaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Ad campaign not found' });
  }

  if (campaign.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Only active campaigns can be ended' });
  }

  campaign.status = 'expired';
  campaign.endDate = new Date();
  await campaign.save();
  await clearPropertyPromotion(campaign.propertyId);

  const populated = await populateCampaign(AdCampaign.findById(campaign._id));
  res.status(200).json({ success: true, data: populated });
});
