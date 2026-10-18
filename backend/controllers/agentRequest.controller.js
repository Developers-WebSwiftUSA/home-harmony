import asyncHandler from '../middleware/asyncHandler.js';
import AgentAssignmentRequest from '../models/AgentAssignmentRequest.model.js';
import Property from '../models/Property.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import { emitPendingActionsUpdatedForAdmins } from '../utils/emitPendingActions.js';

const populateRequest = (query) =>
  query
    .populate('propertyId', 'title location images price listingType status type bedrooms bathrooms agentId')
    .populate('sellerId', 'firstName lastName email phone avatar')
    .populate('preferredAgentId', 'firstName lastName email phone avatar agentProfile')
    .populate('assignedAgentId', 'firstName lastName email phone avatar agentProfile')
    .populate('approvedBy', 'firstName lastName email')
    .populate('rejectedBy', 'firstName lastName email');

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

const findActiveAgent = async (agentId) => {
  if (!agentId) return null;
  return User.findOne({
    _id: agentId,
    role: 'agent',
    status: 'active',
  });
};

// @desc    List agent assignment requests
// @route   GET /api/agent-requests
// @access  Private (seller, admin)
export const getAgentRequests = asyncHandler(async (req, res) => {
  if (!['admin', 'seller'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const { status, propertyId, page = 1, limit = 50 } = req.query;
  const query = {};

  if (req.user.role === 'seller') {
    query.sellerId = req.user.id;
  }

  if (status) query.status = status;
  if (propertyId) query.propertyId = propertyId;

  const requests = await populateRequest(
    AgentAssignmentRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
  );

  const total = await AgentAssignmentRequest.countDocuments(query);

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    data: requests,
  });
});

// @desc    Get one agent assignment request
// @route   GET /api/agent-requests/:id
// @access  Private (seller owner, admin)
export const getAgentRequest = asyncHandler(async (req, res) => {
  const request = await populateRequest(AgentAssignmentRequest.findById(req.params.id));

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  const sellerId = request.sellerId?._id?.toString() || request.sellerId?.toString();
  if (req.user.role !== 'admin' && sellerId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, data: request });
});

// @desc    Seller requests an agent for a property
// @route   POST /api/agent-requests
// @access  Private/Seller
export const createAgentRequest = asyncHandler(async (req, res) => {
  const { propertyId, preferredAgentId, message } = req.body;

  if (!propertyId) {
    return res.status(400).json({ success: false, message: 'Property is required' });
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  if (property.sellerId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only request an agent for your own listings',
    });
  }

  const existingPending = await AgentAssignmentRequest.findOne({
    propertyId,
    status: 'pending',
  });
  if (existingPending) {
    return res.status(400).json({
      success: false,
      message: 'This listing already has a pending agent request',
    });
  }

  let preferred = null;
  if (preferredAgentId) {
    preferred = await findActiveAgent(preferredAgentId);
    if (!preferred) {
      return res.status(400).json({
        success: false,
        message: 'Preferred agent must be an active agent account',
      });
    }
  }

  const request = await AgentAssignmentRequest.create({
    propertyId,
    sellerId: req.user.id,
    preferredAgentId: preferred?._id || null,
    message: typeof message === 'string' ? message.trim().slice(0, 1000) : undefined,
  });

  const populated = await populateRequest(AgentAssignmentRequest.findById(request._id));
  const io = req.app.get('io');
  await emitPendingActionsUpdatedForAdmins(io);

  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notifyUser(io, admin._id, {
        type: 'agent_assignment_request',
        title: 'Agent assignment request',
        message: `A seller requested an agent for "${property.title}"`,
        actionUrl: '/admin/agent-requests',
        relatedId: request._id,
        relatedModel: 'AgentAssignmentRequest',
      })
    )
  );

  res.status(201).json({ success: true, data: populated });
});

// @desc    Cancel a pending agent request
// @route   PUT /api/agent-requests/:id/cancel
// @access  Private (seller owner, admin)
export const cancelAgentRequest = asyncHandler(async (req, res) => {
  const request = await AgentAssignmentRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
  }

  if (req.user.role !== 'admin' && request.sellerId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  request.status = 'cancelled';
  request.cancelledAt = new Date();
  await request.save();

  await emitPendingActionsUpdatedForAdmins(req.app.get('io'));

  const populated = await populateRequest(AgentAssignmentRequest.findById(request._id));
  res.status(200).json({ success: true, data: populated });
});

// @desc    Admin approves request and assigns agent to property
// @route   PUT /api/agent-requests/:id/approve
// @access  Private/Admin
export const approveAgentRequest = asyncHandler(async (req, res) => {
  const { agentId, adminNotes } = req.body;
  const request = await AgentAssignmentRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be approved' });
  }

  const nextAgentId = agentId || request.preferredAgentId;
  if (!nextAgentId) {
    return res.status(400).json({
      success: false,
      message: 'Select an agent to assign',
    });
  }

  const agent = await findActiveAgent(nextAgentId);
  if (!agent) {
    return res.status(400).json({
      success: false,
      message: 'Invalid agent. Choose an active agent account.',
    });
  }

  const property = await Property.findById(request.propertyId);
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  const previousAgentId = property.agentId?.toString();
  property.agentId = agent._id;
  await property.save();

  request.status = 'approved';
  request.assignedAgentId = agent._id;
  request.approvedBy = req.user.id;
  request.approvedAt = new Date();
  if (typeof adminNotes === 'string' && adminNotes.trim()) {
    request.adminNotes = adminNotes.trim();
  }
  await request.save();

  const io = req.app.get('io');
  await emitPendingActionsUpdatedForAdmins(io);

  await notifyUser(io, request.sellerId, {
    type: 'agent_assignment_approved',
    title: 'Agent assigned',
    message: `An agent has been assigned to "${property.title}"`,
    actionUrl: '/seller/listings',
    relatedId: request._id,
    relatedModel: 'AgentAssignmentRequest',
  });

  if (previousAgentId !== agent._id.toString()) {
    await notifyUser(io, agent._id, {
      type: 'property_assigned',
      title: 'Property Assigned',
      message: `You have been assigned to manage "${property.title}"`,
      actionUrl: '/agent',
      relatedId: property._id,
      relatedModel: 'Property',
    });
  }

  const populated = await populateRequest(AgentAssignmentRequest.findById(request._id));
  res.status(200).json({ success: true, data: populated });
});

// @desc    Admin rejects agent request
// @route   PUT /api/agent-requests/:id/reject
// @access  Private/Admin
export const rejectAgentRequest = asyncHandler(async (req, res) => {
  const { rejectionReason, adminNotes } = req.body;
  const request = await AgentAssignmentRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be rejected' });
  }

  const property = await Property.findById(request.propertyId).select('title');

  request.status = 'rejected';
  request.rejectedBy = req.user.id;
  request.rejectedAt = new Date();
  if (typeof rejectionReason === 'string' && rejectionReason.trim()) {
    request.rejectionReason = rejectionReason.trim();
  }
  if (typeof adminNotes === 'string' && adminNotes.trim()) {
    request.adminNotes = adminNotes.trim();
  }
  await request.save();

  const io = req.app.get('io');
  await emitPendingActionsUpdatedForAdmins(io);

  await notifyUser(io, request.sellerId, {
    type: 'agent_assignment_rejected',
    title: 'Agent request declined',
    message: property
      ? `Your agent request for "${property.title}" was declined`
      : 'Your agent request was declined',
    actionUrl: '/seller/listings',
    relatedId: request._id,
    relatedModel: 'AgentAssignmentRequest',
  });

  const populated = await populateRequest(AgentAssignmentRequest.findById(request._id));
  res.status(200).json({ success: true, data: populated });
});
