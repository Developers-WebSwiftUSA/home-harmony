import mongoose from 'mongoose';

const agentAssignmentRequestSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    preferredAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
    cancelledAt: Date,
  },
  { timestamps: true }
);

agentAssignmentRequestSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
agentAssignmentRequestSchema.index({ propertyId: 1, status: 1 });
agentAssignmentRequestSchema.index({ status: 1, createdAt: -1 });

const AgentAssignmentRequest = mongoose.model(
  'AgentAssignmentRequest',
  agentAssignmentRequestSchema
);

export default AgentAssignmentRequest;
