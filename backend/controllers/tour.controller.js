import asyncHandler from '../middleware/asyncHandler.js';
import Tour from '../models/Tour.model.js';
import Property from '../models/Property.model.js';
import Notification from '../models/Notification.model.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendSMS } from '../utils/sendSMS.js';
import { refreshAgentRating, refreshPropertyRating } from '../utils/ratings.js';

// @desc    Get all tours
// @route   GET /api/tours
// @access  Private
export const getTours = asyncHandler(async (req, res) => {
  const { status, propertyId, buyerId, sellerId, agentId, page = 1, limit = 10 } = req.query;

  const query = {};

  // Filter based on user role
  if (req.user.role === 'buyer') {
    query.buyerId = req.user.id;
  } else if (req.user.role === 'seller') {
    query.sellerId = req.user.id;
  } else if (req.user.role === 'agent') {
    query.agentId = req.user.id;
  }

  if (status) query.status = status;
  if (propertyId) query.propertyId = propertyId;
  if (buyerId && req.user.role === 'admin') query.buyerId = buyerId;
  if (sellerId && req.user.role === 'admin') query.sellerId = sellerId;
  if (agentId && req.user.role === 'admin') query.agentId = agentId;

  const tours = await Tour.find(query)
    .populate('propertyId', 'title location images price')
    .populate('buyerId', 'firstName lastName email phone')
    .populate('sellerId', 'firstName lastName email phone')
    .populate('agentId', 'firstName lastName email phone')
    .populate('rescheduleHistory.requestedBy', 'firstName lastName email')
    .populate('rescheduleHistory.approvedBy', 'firstName lastName email')
    .populate('pendingReschedule.requestedBy', 'firstName lastName email')
    .sort({ date: 1, startTime: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Tour.countDocuments(query);

  res.status(200).json({
    success: true,
    count: tours.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: tours
  });
});

// @desc    Get single tour
// @route   GET /api/tours/:id
// @access  Private
export const getTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id)
    .populate('propertyId')
    .populate('buyerId')
    .populate('sellerId')
    .populate('agentId')
    .populate('rescheduleHistory.requestedBy')
    .populate('rescheduleHistory.approvedBy')
    .populate('pendingReschedule.requestedBy');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Check authorization
  const isAuthorized =
    tour.buyerId._id.toString() === req.user.id ||
    tour.sellerId._id.toString() === req.user.id ||
    (tour.agentId && tour.agentId._id.toString() === req.user.id) ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this tour'
    });
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Create tour request
// @route   POST /api/tours
// @access  Private/Buyer
export const createTour = asyncHandler(async (req, res) => {
  const { propertyId, date, startTime, endTime, message, tourType } = req.body;

  // Get property to find seller
  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if buyer is trying to tour their own property
  if (property.sellerId.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot request a tour for your own property'
    });
  }

  // Check for conflicts
  const conflictingTour = await Tour.findOne({
    propertyId,
    date: new Date(date),
    startTime,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (conflictingTour) {
    return res.status(400).json({
      success: false,
      message: 'This time slot is already booked'
    });
  }

  const tour = await Tour.create({
    propertyId,
    buyerId: req.user.id,
    sellerId: property.sellerId,
    agentId: property.agentId || null,
    date,
    startTime,
    endTime,
    message,
    tourType: tourType || 'in-person'
  });

  const populatedTour = await Tour.findById(tour._id)
    .populate('propertyId', 'title location')
    .populate('buyerId', 'firstName lastName email phone');

  // Notify seller
  await Notification.create({
    userId: property.sellerId,
    type: 'tour_request',
    title: 'New Tour Request',
    message: `${req.user.firstName || req.user.email} requested a tour for "${property.title}"`,
    relatedId: tour._id,
    relatedModel: 'Tour'
  });

  // Notify assigned agent
  if (property.agentId) {
    await Notification.create({
      userId: property.agentId,
      type: 'tour_request',
      title: 'New Tour Request',
      message: `${req.user.firstName || req.user.email} requested a tour for "${property.title}"`,
      relatedId: tour._id,
      relatedModel: 'Tour'
    });
  }

  // Send email to seller
  try {
    const seller = await Property.findById(propertyId).populate('sellerId');
    await sendEmail({
      email: seller.sellerId.email,
      subject: 'New Tour Request',
      text: `You have a new tour request for ${property.title}`,
      html: `<p>You have a new tour request for <strong>${property.title}</strong></p>`
    });
  } catch (error) {
    console.error('Email error:', error);
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`user-${property.sellerId}`).emit('tour-updated', populatedTour);
    if (property.agentId) {
      io.to(`user-${property.agentId}`).emit('tour-updated', populatedTour);
    }
  }

  res.status(201).json({
    success: true,
    data: populatedTour
  });
});

// @desc    Update tour status
// @route   PUT /api/tours/:id/status
// @access  Private
export const updateTourStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason, cancelledBy } = req.body;

  const tour = await Tour.findById(req.params.id)
    .populate('propertyId')
    .populate('buyerId')
    .populate('sellerId');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Authorization check
  const canUpdate =
    (req.user.role === 'seller' && tour.sellerId._id.toString() === req.user.id) ||
    (req.user.role === 'buyer' && tour.buyerId._id.toString() === req.user.id) ||
    (req.user.role === 'agent' && tour.agentId && tour.agentId.toString() === req.user.id) ||
    req.user.role === 'admin';

  if (!canUpdate) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this tour'
    });
  }

  tour.status = status;
  if (cancellationReason) tour.cancellationReason = cancellationReason;
  if (cancelledBy) tour.cancelledBy = cancelledBy;

  await tour.save();

  // Send notifications
  if (status === 'confirmed') {
    await Notification.create({
      userId: tour.buyerId._id,
      type: 'tour_confirmed',
      title: 'Tour Confirmed',
      message: `Your tour for "${tour.propertyId.title}" has been confirmed`,
      relatedId: tour._id,
      relatedModel: 'Tour'
    });

    // Send SMS to buyer
    try {
      await sendSMS(
        tour.buyerId.phone,
        `Your tour for ${tour.propertyId.title} on ${tour.date} at ${tour.startTime} has been confirmed.`
      );
    } catch (error) {
      console.error('SMS error:', error);
    }
  }

  if (status === 'cancelled') {
    const cancelledByBuyer = req.user.id === tour.buyerId._id.toString();
    const notifyIds = cancelledByBuyer
      ? [tour.sellerId._id]
      : [tour.buyerId._id];
    if (tour.agentId) {
      notifyIds.push(tour.agentId._id || tour.agentId);
    }

    for (const userId of notifyIds) {
      await Notification.create({
        userId,
        type: 'tour_cancelled',
        title: 'Tour Cancelled',
        message: `Tour for "${tour.propertyId.title}" has been cancelled`,
        relatedId: tour._id,
        relatedModel: 'Tour'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Approve tour
// @route   PUT /api/tours/:id/approve
// @access  Private/Seller/Agent/Admin
export const approveTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id)
    .populate('propertyId', 'title location')
    .populate('buyerId', 'firstName lastName email phone')
    .populate('sellerId')
    .populate('agentId');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Authorization: seller, agent, or admin
  const canApprove =
    (req.user.role === 'seller' && tour.sellerId._id.toString() === req.user.id) ||
    (req.user.role === 'agent' && tour.agentId && tour.agentId._id.toString() === req.user.id) ||
    req.user.role === 'admin';

  if (!canApprove) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to approve this tour'
    });
  }

  if (tour.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending tours can be approved'
    });
  }

  tour.status = 'confirmed';
  await tour.save();

  // Create notification for buyer
  await Notification.create({
    userId: tour.buyerId._id,
    type: 'tour_confirmed',
    title: 'Tour Confirmed',
    message: `Your tour for "${tour.propertyId.title}" has been confirmed`,
    relatedId: tour._id,
    relatedModel: 'Tour'
  });

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${tour.buyerId._id}`).emit('tour-updated', tour);
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Decline tour
// @route   PUT /api/tours/:id/decline
// @access  Private/Seller/Agent/Admin
export const declineTour = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const tour = await Tour.findById(req.params.id)
    .populate('propertyId', 'title location')
    .populate('buyerId', 'firstName lastName email phone')
    .populate('sellerId')
    .populate('agentId');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Authorization: seller, agent, or admin
  const canDecline =
    (req.user.role === 'seller' && tour.sellerId._id.toString() === req.user.id) ||
    (req.user.role === 'agent' && tour.agentId && tour.agentId._id.toString() === req.user.id) ||
    req.user.role === 'admin';

  if (!canDecline) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to decline this tour'
    });
  }

  if (tour.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending tours can be declined'
    });
  }

  tour.status = 'declined';
  tour.cancellationReason = reason;
  tour.cancelledBy = req.user.role;
  await tour.save();

  // Create notification for buyer
  await Notification.create({
    userId: tour.buyerId._id,
    type: 'tour_declined',
    title: 'Tour Declined',
    message: `Your tour request for "${tour.propertyId.title}" has been declined${reason ? `: ${reason}` : ''}`,
    relatedId: tour._id,
    relatedModel: 'Tour'
  });

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${tour.buyerId._id}`).emit('tour-updated', tour);
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Request reschedule
// @route   PUT /api/tours/:id/reschedule
// @access  Private/Seller/Agent/Admin
export const rescheduleTour = asyncHandler(async (req, res) => {
  const { newDate, newStartTime, newEndTime, reason, comment } = req.body;

  const tour = await Tour.findById(req.params.id)
    .populate('propertyId', 'title location')
    .populate('buyerId', 'firstName lastName email phone')
    .populate('sellerId')
    .populate('agentId');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Authorization: seller, agent, or admin
  const canReschedule =
    (req.user.role === 'seller' && tour.sellerId._id.toString() === req.user.id) ||
    (req.user.role === 'agent' && tour.agentId && tour.agentId._id.toString() === req.user.id) ||
    req.user.role === 'admin';

  if (!canReschedule) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to reschedule this tour'
    });
  }

  if (tour.status !== 'confirmed' && tour.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only confirmed or pending tours can be rescheduled'
    });
  }

  // Check for conflicts at the new slot (exclude this tour)
  const conflictingTour = await Tour.findOne({
    _id: { $ne: tour._id },
    propertyId: tour.propertyId._id || tour.propertyId,
    date: new Date(newDate),
    startTime: newStartTime,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (conflictingTour) {
    return res.status(400).json({
      success: false,
      message: 'This time slot is already booked'
    });
  }

  // Add to reschedule history
  if (!tour.rescheduleHistory) {
    tour.rescheduleHistory = [];
  }

  tour.rescheduleHistory.push({
    requestedBy: req.user.id,
    requestedByRole: req.user.role,
    oldDate: tour.date,
    oldStartTime: tour.startTime,
    oldEndTime: tour.endTime,
    newDate: new Date(newDate),
    newStartTime,
    newEndTime,
    reason,
    comment,
    status: 'pending'
  });

  // Set pending reschedule
  tour.pendingReschedule = {
    requestedBy: req.user.id,
    requestedByRole: req.user.role,
    newDate: new Date(newDate),
    newStartTime,
    newEndTime,
    reason,
    comment,
    requestedAt: new Date()
  };

  tour.status = 'reschedule_pending_buyer_approval';
  await tour.save();

  // Create notification for buyer
  await Notification.create({
    userId: tour.buyerId._id,
    type: 'tour_reschedule_requested',
    title: 'Tour Reschedule Requested',
    message: `${req.user.firstName || req.user.email} has requested to reschedule your tour for "${tour.propertyId.title}"`,
    relatedId: tour._id,
    relatedModel: 'Tour'
  });

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${tour.buyerId._id}`).emit('tour-updated', tour);
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Approve reschedule
// @route   PUT /api/tours/:id/approve-reschedule
// @access  Private/Buyer
export const approveReschedule = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id)
    .populate('propertyId', 'title location')
    .populate('buyerId', 'firstName lastName email phone')
    .populate('sellerId')
    .populate('agentId');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Authorization: only buyer
  if (tour.buyerId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Only the buyer can approve reschedule requests'
    });
  }

  if (tour.status !== 'reschedule_pending_buyer_approval' || !tour.pendingReschedule) {
    return res.status(400).json({
      success: false,
      message: 'No pending reschedule request found'
    });
  }

  // Update tour date/time
  tour.date = tour.pendingReschedule.newDate;
  tour.startTime = tour.pendingReschedule.newStartTime;
  tour.endTime = tour.pendingReschedule.newEndTime;

  // Update reschedule history
  const lastReschedule = tour.rescheduleHistory[tour.rescheduleHistory.length - 1];
  if (lastReschedule) {
    lastReschedule.status = 'approved';
    lastReschedule.approvedBy = req.user.id;
    lastReschedule.approvedAt = new Date();
  }

  tour.status = 'confirmed';
  tour.pendingReschedule = undefined;
  await tour.save();

  // Create notification for seller/agent
  const notifyUserId = tour.agentId ? tour.agentId._id : tour.sellerId._id;
  await Notification.create({
    userId: notifyUserId,
    type: 'tour_reschedule_approved',
    title: 'Reschedule Approved',
    message: `Buyer has approved the reschedule request for tour of "${tour.propertyId.title}"`,
    relatedId: tour._id,
    relatedModel: 'Tour'
  });

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${notifyUserId}`).emit('tour-updated', tour);
    io.to(`user-${tour.buyerId._id}`).emit('tour-updated', tour);
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Reject reschedule
// @route   PUT /api/tours/:id/reject-reschedule
// @access  Private/Buyer
export const rejectReschedule = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const tour = await Tour.findById(req.params.id)
    .populate('propertyId', 'title location')
    .populate('buyerId', 'firstName lastName email phone')
    .populate('sellerId')
    .populate('agentId');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Authorization: only buyer
  if (tour.buyerId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Only the buyer can reject reschedule requests'
    });
  }

  if (tour.status !== 'reschedule_pending_buyer_approval' || !tour.pendingReschedule) {
    return res.status(400).json({
      success: false,
      message: 'No pending reschedule request found'
    });
  }

  // Update reschedule history
  const lastReschedule = tour.rescheduleHistory[tour.rescheduleHistory.length - 1];
  if (lastReschedule) {
    lastReschedule.status = 'rejected';
    lastReschedule.approvedBy = req.user.id;
    lastReschedule.approvedAt = new Date();
    if (reason) {
      lastReschedule.comment = (lastReschedule.comment || '') + ` [Rejection reason: ${reason}]`;
    }
  }

  tour.status = 'confirmed';
  tour.pendingReschedule = undefined;
  await tour.save();

  // Create notification for seller/agent
  const notifyUserId = tour.agentId ? tour.agentId._id : tour.sellerId._id;
  await Notification.create({
    userId: notifyUserId,
    type: 'tour_reschedule_rejected',
    title: 'Reschedule Rejected',
    message: `Buyer has rejected the reschedule request for tour of "${tour.propertyId.title}"${reason ? `: ${reason}` : ''}`,
    relatedId: tour._id,
    relatedModel: 'Tour'
  });

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${notifyUserId}`).emit('tour-updated', tour);
    io.to(`user-${tour.buyerId._id}`).emit('tour-updated', tour);
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Mark tour as complete
// @route   PUT /api/tours/:id/complete
// @access  Private/Buyer
export const markComplete = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id)
    .populate('propertyId', 'title location')
    .populate('buyerId')
    .populate('sellerId')
    .populate('agentId');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Authorization: only buyer
  if (tour.buyerId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Only the buyer can mark tour as complete'
    });
  }

  if (tour.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Only confirmed tours can be marked as complete'
    });
  }

  tour.status = 'completed';
  await tour.save();

  // Create notification for seller/agent
  const notifyUserId = tour.agentId ? tour.agentId._id : tour.sellerId._id;
  await Notification.create({
    userId: notifyUserId,
    type: 'tour_completed',
    title: 'Tour Completed',
    message: `Tour for "${tour.propertyId.title}" has been marked as completed`,
    relatedId: tour._id,
    relatedModel: 'Tour'
  });

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${notifyUserId}`).emit('tour-updated', tour);
    io.to(`user-${tour.buyerId._id}`).emit('tour-updated', tour);
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Get available time slots
// @route   GET /api/tours/availability
// @access  Public
export const getAvailability = asyncHandler(async (req, res) => {
  const { propertyId, date, excludeTourId } = req.query;

  if (!propertyId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide propertyId and date'
    });
  }

  const tourQuery = {
    propertyId,
    date: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  };
  if (excludeTourId) {
    tourQuery._id = { $ne: excludeTourId };
  }

  // Get all tours for this property on this date
  const tours = await Tour.find(tourQuery).select('startTime endTime');

  // Define available time slots (9 AM to 6 PM, hourly)
  const allSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    allSlots.push({
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      available: true
    });
  }

  // Mark booked slots
  tours.forEach(tour => {
    const slotIndex = allSlots.findIndex(
      slot => slot.startTime === tour.startTime
    );
    if (slotIndex !== -1) {
      allSlots[slotIndex].available = false;
    }
  });

  res.status(200).json({
    success: true,
    data: allSlots
  });
});

// @desc    Get tours with submitted feedback (reviews)
// @route   GET /api/tours/reviews
// @access  Private
export const getTourReviews = asyncHandler(async (req, res) => {
  const { userId, propertyId, page = 1, limit = 200 } = req.query;

  const query = {
    status: 'completed',
    'feedback.propertyRating': { $exists: true, $ne: null }
  };

  if (propertyId) {
    query.propertyId = propertyId;
  }

  if (req.user.role === 'buyer') {
    query.buyerId = req.user.id;
  } else if (req.user.role === 'seller') {
    query.sellerId = req.user.id;
  } else if (req.user.role === 'agent') {
    query.agentId = req.user.id;
  } else if (req.user.role === 'admin' && userId) {
    query.$or = [
      { buyerId: userId },
      { sellerId: userId },
      { agentId: userId }
    ];
  }

  const parsedLimit = Math.min(parseInt(limit, 10) || 200, 500);
  const parsedPage = parseInt(page, 10) || 1;

  const tours = await Tour.find(query)
    .populate('propertyId', 'title location images price')
    .populate('buyerId', 'firstName lastName email phone')
    .populate('sellerId', 'firstName lastName email phone')
    .populate('agentId', 'firstName lastName email phone')
    .sort({ 'feedback.submittedAt': -1, updatedAt: -1 })
    .limit(parsedLimit)
    .skip((parsedPage - 1) * parsedLimit);

  const total = await Tour.countDocuments(query);

  res.status(200).json({
    success: true,
    count: tours.length,
    total,
    page: parsedPage,
    pages: Math.ceil(total / parsedLimit),
    data: tours
  });
});

// @desc    Submit tour feedback
// @route   PUT /api/tours/:id/feedback
// @access  Private/Buyer
export const submitFeedback = asyncHandler(async (req, res) => {
  const { propertyRating, agentRating, propertyComment, agentComment, overallExperience, wouldRecommend } = req.body;

  const tour = await Tour.findById(req.params.id)
    .populate('propertyId', 'title location')
    .populate('buyerId')
    .populate('sellerId')
    .populate('agentId');

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Authorization: only buyer
  if (tour.buyerId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Only the buyer can submit feedback'
    });
  }

  if (tour.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Feedback can only be submitted for completed tours'
    });
  }

  if (!propertyRating || propertyRating < 1 || propertyRating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Property rating is required and must be between 1 and 5'
    });
  }

  tour.feedback = {
    propertyRating,
    agentRating: agentRating || undefined,
    propertyComment: propertyComment || undefined,
    agentComment: agentComment || undefined,
    overallExperience: overallExperience || undefined,
    wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : undefined,
    submittedAt: new Date()
  };

  await tour.save();

  await refreshPropertyRating(tour.propertyId._id || tour.propertyId);
  if (tour.agentId) {
    await refreshAgentRating(tour.agentId._id || tour.agentId);
  }

  // Create notification for seller/agent about new review
  const notifyUserId = tour.agentId ? tour.agentId._id : tour.sellerId._id;
  await Notification.create({
    userId: notifyUserId,
    type: 'tour_feedback_submitted',
    title: 'New Review Received',
    message: `You received a ${propertyRating}-star review for the tour of "${tour.propertyId.title}"`,
    relatedId: tour._id,
    relatedModel: 'Tour'
  });

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${notifyUserId}`).emit('tour-updated', tour);
  }

  res.status(200).json({
    success: true,
    data: tour
  });
});
