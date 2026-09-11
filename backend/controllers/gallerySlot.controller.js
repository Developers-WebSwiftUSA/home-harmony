import asyncHandler from '../middleware/asyncHandler.js';
import GallerySlotPurchase from '../models/GallerySlotPurchase.model.js';
import Property from '../models/Property.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import { getPlatformSettings } from '../models/PlatformSettings.model.js';
import {
  FREE_GALLERY_COUNT,
  FREE_MAIN_COUNT,
  calculateSlotTotal,
  getLockedGalleryCount,
  splitImages,
} from '../utils/galleryPricing.js';
import { emitPendingActionsUpdatedForAdmins } from '../utils/emitPendingActions.js';

const populatePurchase = (query) =>
  query
    .populate('propertyId', 'title location images price listingType status type paidGallerySlots')
    .populate('requesterId', 'firstName lastName email role')
    .populate('approvedBy', 'firstName lastName email')
    .populate('rejectedBy', 'firstName lastName email');

const canAccessPurchase = (purchase, user) => {
  if (user.role === 'admin') return true;
  return purchase.requesterId?._id?.toString() === user.id || purchase.requesterId?.toString() === user.id;
};

const canManagePropertyGallery = (property, user) => {
  if (user.role === 'admin') return true;
  if (user.role === 'seller') return property.sellerId?.toString() === user.id;
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

const mockChargePayment = async (purchase) => {
  if (!purchase.payment?.cardLast4) {
    throw new Error('Payment details are missing');
  }
  return {
    paymentStatus: 'charged',
    chargedAmount: purchase.totalAmount,
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

const pricingPayload = (settings) => ({
  freeMainCount: FREE_MAIN_COUNT,
  freeGalleryCount: FREE_GALLERY_COUNT,
  pricePerSlot: settings.gallerySlotPrice,
  description:
    'The main photo is always free. The first 3 gallery photos are free. Extra gallery photos require Pay to Go.',
});

export const getGalleryPricing = asyncHandler(async (req, res) => {
  const settings = await getPlatformSettings();
  res.status(200).json({ success: true, data: pricingPayload(settings) });
});

export const getGallerySettings = asyncHandler(async (req, res) => {
  const settings = await getPlatformSettings();
  res.status(200).json({ success: true, data: pricingPayload(settings) });
});

export const updateGallerySettings = asyncHandler(async (req, res) => {
  const settings = await getPlatformSettings();
  const nextPrice = Number(req.body.pricePerSlot);
  if (!(nextPrice >= 0)) {
    return res.status(400).json({ success: false, message: 'Enter a valid extra photo price' });
  }
  settings.gallerySlotPrice = Math.round(nextPrice * 100) / 100;
  await settings.save();
  res.status(200).json({ success: true, data: pricingPayload(settings) });
});

export const getGalleryUsage = asyncHandler(async (req, res) => {
  const properties = await Property.find({ 'images.3': { $exists: true } })
    .select('title status listingType images paidGallerySlots sellerId')
    .populate('sellerId', 'firstName lastName email')
    .sort({ updatedAt: -1 })
    .limit(200);

  const listings = properties
    .map((property) => {
      const { gallery } = splitImages(property.images);
      const paidGallerySlots = property.paidGallerySlots || 0;
      const lockedCount = getLockedGalleryCount(property.images, paidGallerySlots);
      return {
        _id: property._id,
        title: property.title,
        status: property.status,
        listingType: property.listingType,
        sellerId: property.sellerId,
        galleryCount: gallery.length,
        paidGallerySlots,
        lockedCount,
        publicGalleryCount: Math.max(0, gallery.length - lockedCount),
      };
    })
    .filter((row) => row.galleryCount > FREE_GALLERY_COUNT || row.paidGallerySlots > 0);

  res.status(200).json({
    success: true,
    count: listings.length,
    data: listings,
  });
});

export const getGalleryPurchases = asyncHandler(async (req, res) => {
  if (!['admin', 'seller'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const { status, propertyId, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === 'seller') {
    query.requesterId = req.user.id;
  }

  if (status) query.status = status;
  if (propertyId) query.propertyId = propertyId;

  const purchases = await populatePurchase(
    GallerySlotPurchase.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
  );

  const total = await GallerySlotPurchase.countDocuments(query);

  let statusCounts;
  if (req.user.role === 'admin') {
    const [grouped, charged] = await Promise.all([
      GallerySlotPurchase.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      GallerySlotPurchase.aggregate([
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
    statusCounts.approved = statusCounts.approved || 0;
    statusCounts.revenue = charged[0]?.total || 0;
    statusCounts.payments = charged[0]?.count || 0;
  }

  res.status(200).json({
    success: true,
    count: purchases.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    ...(statusCounts && { statusCounts }),
    data: purchases,
  });
});

export const getGalleryPurchase = asyncHandler(async (req, res) => {
  const purchase = await populatePurchase(GallerySlotPurchase.findById(req.params.id));

  if (!purchase) {
    return res.status(404).json({ success: false, message: 'Pay to Go request not found' });
  }

  if (!canAccessPurchase(purchase, req.user)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, data: purchase });
});

export const createGalleryPurchase = asyncHandler(async (req, res) => {
  const { propertyId, slotsRequested, cardHolderName, cardNumber, billingEmail, billingAddress } = req.body;

  if (!propertyId || !cardHolderName || !cardNumber || !billingEmail) {
    return res.status(400).json({
      success: false,
      message: 'Property, cardholder name, card number, and billing email are required',
    });
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

  if (!canManagePropertyGallery(property, req.user)) {
    return res.status(403).json({ success: false, message: 'Not authorized for this property' });
  }

  const existingPending = await GallerySlotPurchase.findOne({
    propertyId,
    status: 'pending',
  });
  if (existingPending) {
    return res.status(400).json({
      success: false,
      message: 'This listing already has a pending Pay to Go request. Cancel it first to submit a new one.',
    });
  }

  const settings = await getPlatformSettings();
  const slots = Math.floor(Number(slotsRequested) || 0);
  const pricePerSlot = settings.gallerySlotPrice;
  let totalAmount;
  try {
    totalAmount = calculateSlotTotal(slots, pricePerSlot);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const purchase = await GallerySlotPurchase.create({
    propertyId,
    requesterId: req.user.id,
    requesterRole: req.user.role === 'admin' ? 'admin' : 'seller',
    slotsRequested: slots,
    pricePerSlot,
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

  const populated = await populatePurchase(GallerySlotPurchase.findById(purchase._id));
  const io = req.app.get('io');
  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notifyUser(io, admin._id, {
        type: 'gallery_slot_request',
        title: 'New gallery Pay to Go request',
        message: `${req.user.firstName || 'A seller'} requested ${slots} extra photo slot${slots === 1 ? '' : 's'} for ${property.title}.`,
        actionUrl: '/admin/gallery-photos',
        relatedId: purchase._id,
        relatedModel: 'GallerySlotPurchase',
      })
    )
  );
  await emitPendingActionsUpdatedForAdmins(io);

  res.status(201).json({ success: true, data: populated });
});

export const cancelGalleryPurchase = asyncHandler(async (req, res) => {
  const purchase = await GallerySlotPurchase.findById(req.params.id);

  if (!purchase) {
    return res.status(404).json({ success: false, message: 'Pay to Go request not found' });
  }

  if (!canAccessPurchase(purchase, req.user)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (purchase.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
  }

  purchase.status = 'cancelled';
  purchase.cancelledAt = new Date();
  await purchase.save();

  const populated = await populatePurchase(GallerySlotPurchase.findById(purchase._id));
  await emitPendingActionsUpdatedForAdmins(req.app.get('io'));
  res.status(200).json({ success: true, data: populated });
});

export const approveGalleryPurchase = asyncHandler(async (req, res) => {
  const { adminNotes } = req.body;
  const purchase = await GallerySlotPurchase.findById(req.params.id);

  if (!purchase) {
    return res.status(404).json({ success: false, message: 'Pay to Go request not found' });
  }

  if (purchase.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be approved' });
  }

  const property = await Property.findById(purchase.propertyId);
  if (!property) {
    return res.status(400).json({ success: false, message: 'Property is no longer available' });
  }

  const charge = await mockChargePayment(purchase);
  purchase.status = 'approved';
  purchase.paymentStatus = charge.paymentStatus;
  purchase.chargedAmount = charge.chargedAmount;
  purchase.chargedAt = charge.chargedAt;
  purchase.slotsGranted = purchase.slotsRequested;
  purchase.approvedBy = req.user.id;
  purchase.approvedAt = new Date();
  if (adminNotes) purchase.adminNotes = String(adminNotes).trim();
  await purchase.save();

  property.paidGallerySlots = (property.paidGallerySlots || 0) + purchase.slotsGranted;
  await property.save();

  const populated = await populatePurchase(GallerySlotPurchase.findById(purchase._id));
  const io = req.app.get('io');
  await notifyUser(io, purchase.requesterId, {
    type: 'gallery_slot_approved',
    title: 'Extra photos unlocked',
    message: `${purchase.slotsGranted} extra gallery photo slot${purchase.slotsGranted === 1 ? '' : 's'} for ${property.title} ${purchase.slotsGranted === 1 ? 'is' : 'are'} now live.`,
    actionUrl: `/seller/listings/${property._id}/edit`,
    relatedId: purchase._id,
    relatedModel: 'GallerySlotPurchase',
  });
  await emitPendingActionsUpdatedForAdmins(io);

  res.status(200).json({ success: true, data: populated });
});

export const rejectGalleryPurchase = asyncHandler(async (req, res) => {
  const { rejectionReason, adminNotes } = req.body;
  const purchase = await GallerySlotPurchase.findById(req.params.id);

  if (!purchase) {
    return res.status(404).json({ success: false, message: 'Pay to Go request not found' });
  }

  if (purchase.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be rejected' });
  }

  purchase.status = 'rejected';
  purchase.paymentStatus = 'pending';
  purchase.rejectedBy = req.user.id;
  purchase.rejectedAt = new Date();
  purchase.rejectionReason = rejectionReason
    ? String(rejectionReason).trim()
    : 'Pay to Go request rejected by admin';
  if (adminNotes) purchase.adminNotes = String(adminNotes).trim();
  await purchase.save();

  const populated = await populatePurchase(GallerySlotPurchase.findById(purchase._id));
  const property = await Property.findById(purchase.propertyId).select('title');
  const io = req.app.get('io');
  await notifyUser(io, purchase.requesterId, {
    type: 'gallery_slot_rejected',
    title: 'Gallery Pay to Go declined',
    message: purchase.rejectionReason,
    actionUrl: property?._id ? `/seller/listings/${property._id}/edit` : '/seller/listings',
    relatedId: purchase._id,
    relatedModel: 'GallerySlotPurchase',
  });
  await emitPendingActionsUpdatedForAdmins(io);

  res.status(200).json({ success: true, data: populated });
});

export const refundGalleryPurchase = asyncHandler(async (req, res) => {
  const { adminNotes } = req.body;
  const purchase = await GallerySlotPurchase.findById(req.params.id);

  if (!purchase) {
    return res.status(404).json({ success: false, message: 'Pay to Go request not found' });
  }

  if (purchase.status !== 'approved' || purchase.paymentStatus !== 'charged') {
    return res.status(400).json({ success: false, message: 'Only charged purchases can be refunded' });
  }

  const property = await Property.findById(purchase.propertyId);
  purchase.status = 'refunded';
  purchase.paymentStatus = 'refunded';
  purchase.refundedAt = new Date();
  if (adminNotes) purchase.adminNotes = String(adminNotes).trim();
  await purchase.save();

  if (property) {
    property.paidGallerySlots = Math.max(0, (property.paidGallerySlots || 0) - (purchase.slotsGranted || 0));
    await property.save();
  }

  const populated = await populatePurchase(GallerySlotPurchase.findById(purchase._id));
  await emitPendingActionsUpdatedForAdmins(req.app.get('io'));
  res.status(200).json({ success: true, data: populated });
});

export const grantGallerySlots = asyncHandler(async (req, res) => {
  const { slots } = req.body;
  const add = Math.trunc(Number(slots));
  if (!add) {
    return res.status(400).json({ success: false, message: 'Enter a non-zero number of slots to grant or revoke' });
  }

  const property = await Property.findById(req.params.propertyId);
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  property.paidGallerySlots = Math.max(0, (property.paidGallerySlots || 0) + add);
  await property.save();

  res.status(200).json({
    success: true,
    data: {
      _id: property._id,
      title: property.title,
      paidGallerySlots: property.paidGallerySlots,
    },
  });
});
