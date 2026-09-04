import asyncHandler from '../middleware/asyncHandler.js';
import RentalApplication from '../models/RentalApplication.model.js';
import Property from '../models/Property.model.js';
import Notification from '../models/Notification.model.js';
import { emitPendingActionsUpdated } from '../utils/emitPendingActions.js';

const isRentalListing = (property) =>
  property.listingType === 'rent' || property.listingType === 'both';

const populateApplication = (query) =>
  query
    .populate('propertyId', 'title location images price listingType rentalDetails')
    .populate('buyerId', 'firstName lastName email phone')
    .populate('sellerId', 'firstName lastName email phone')
    .populate('agentId', 'firstName lastName email phone')
    .populate('reviewedBy', 'firstName lastName email');

const canAccessApplication = (application, user) => {
  if (user.role === 'admin') return true;
  if (user.role === 'buyer') return application.buyerId?.toString() === user.id;
  if (user.role === 'seller') return application.sellerId?.toString() === user.id;
  if (user.role === 'agent') return application.agentId?.toString() === user.id;
  return false;
};

// @desc    List rental applications
// @route   GET /api/rental-applications
// @access  Private
export const getRentalApplications = asyncHandler(async (req, res) => {
  const { status, propertyId, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === 'buyer') {
    query.buyerId = req.user.id;
  } else if (req.user.role === 'seller') {
    query.sellerId = req.user.id;
  } else if (req.user.role === 'agent') {
    query.agentId = req.user.id;
  }

  if (status) query.status = status;
  if (propertyId) query.propertyId = propertyId;

  const applications = await populateApplication(
    RentalApplication.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
  );

  const total = await RentalApplication.countDocuments(query);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: applications
  });
});

// @desc    Get rental application
// @route   GET /api/rental-applications/:id
// @access  Private
export const getRentalApplication = asyncHandler(async (req, res) => {
  const application = await populateApplication(RentalApplication.findById(req.params.id));

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  if (!canAccessApplication(application, req.user)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, data: application });
});

// @desc    Submit rental application
// @route   POST /api/rental-applications
// @access  Private (buyer)
export const createRentalApplication = asyncHandler(async (req, res) => {
  const { propertyId, fullName, email, phone, moveInDate, message } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  if (!isRentalListing(property)) {
    return res.status(400).json({ success: false, message: 'This property is not available for rent' });
  }

  if (property.sellerId?.toString() === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot apply to your own listing' });
  }

  const existing = await RentalApplication.findOne({
    propertyId,
    buyerId: req.user.id,
    status: { $in: ['pending', 'reviewing', 'approved'] }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active application for this rental'
    });
  }

  const application = await RentalApplication.create({
    propertyId,
    buyerId: req.user.id,
    sellerId: property.sellerId,
    agentId: property.agentId || null,
    fullName,
    email,
    phone,
    moveInDate: moveInDate ? new Date(moveInDate) : undefined,
    message
  });

  const populated = await populateApplication(RentalApplication.findById(application._id));

  const applicantName = fullName || req.user.firstName || req.user.email;
  const notifySeller = {
    type: 'rental_application',
    title: 'New Rental Application',
    message: `${applicantName} applied for "${property.title}"`,
    relatedId: application._id,
    relatedModel: 'RentalApplication',
    actionUrl: '/seller/applications'
  };

  await Notification.create({ userId: property.sellerId, ...notifySeller });
  if (property.agentId) {
    await Notification.create({
      userId: property.agentId,
      ...notifySeller,
      actionUrl: '/agent/applications'
    });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`user-${property.sellerId}`).emit('rental-application', populated);
    if (property.agentId) {
      io.to(`user-${property.agentId}`).emit('rental-application', populated);
    }
    emitPendingActionsUpdated(io, property.sellerId, property.agentId);
  }

  res.status(201).json({ success: true, data: populated });
});

// @desc    Update rental application status
// @route   PUT /api/rental-applications/:id/status
// @access  Private (seller, agent, admin)
export const updateRentalApplicationStatus = asyncHandler(async (req, res) => {
  const { status, statusNote } = req.body;
  const allowed = ['reviewing', 'approved', 'rejected', 'withdrawn'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const application = await RentalApplication.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const isOwner =
    req.user.role === 'admin' ||
    application.sellerId.toString() === req.user.id ||
    (application.agentId && application.agentId.toString() === req.user.id);

  const isBuyerWithdraw =
    status === 'withdrawn' &&
    req.user.role === 'buyer' &&
    application.buyerId.toString() === req.user.id;

  if (!isOwner && !isBuyerWithdraw) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  application.status = status;
  application.statusNote = statusNote || undefined;
  if (status !== 'pending' && status !== 'withdrawn') {
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.id;
  }
  await application.save();

  const populated = await populateApplication(RentalApplication.findById(application._id));

  if (status !== 'withdrawn') {
    await Notification.create({
      userId: application.buyerId,
      type: 'rental_application',
      title: 'Rental Application Updated',
      message: `Your application for a rental was marked as ${status}`,
      relatedId: application._id,
      relatedModel: 'RentalApplication',
      actionUrl: '/buyer/applications'
    });
  }

  emitPendingActionsUpdated(req.app.get('io'), req.user.id, application.sellerId, application.agentId, application.buyerId);

  res.status(200).json({ success: true, data: populated });
});
