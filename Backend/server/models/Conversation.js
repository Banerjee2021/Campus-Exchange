import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participants.userModel',
      required: true
    },
    userModel: {
      type: String,
      enum: ['User', 'Admin'],
      required: true
    }
  }],
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: () => new Map()
  }
}, { timestamps: true });

// Create a compound index to ensure uniqueness of conversations between two users about a specific product
conversationSchema.index({ 
  'participants.user': 1, 
  'productId': 1 
}, { 
  unique: true,
  partialFilterExpression: { productId: { $ne: null } }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;