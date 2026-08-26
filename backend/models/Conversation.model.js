import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  directKey: {
    type: String,
    default: null
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: Date,
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  isArchived: {
    type: Boolean,
    default: false
  },
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

conversationSchema.index({ participants: 1 });
conversationSchema.index({ propertyId: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ directKey: 1 }, { unique: true, sparse: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
