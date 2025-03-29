import express from 'express';
import { verifyToken, optionalVerifyToken } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to determine user type
const getUserTypeAndId = async (userId) => {
  // Try to find user first
  const user = await User.findById(userId);
  if (user) {
    return { id: user._id, model: 'User' };
  }
  
  // If not found, try to find admin
  const admin = await Admin.findById(userId);
  if (admin) {
    return { id: admin._id, model: 'Admin' };
  }
  
  return null;
};

// Get all conversations for the current user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const userModel = req.user.isAdmin ? 'Admin' : 'User';
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      'participants.user': userId,
      'participants.userModel': userModel
    }).sort({ lastMessageAt: -1 });
    
    // Get the other participant's details and format the response
    const populatedConversations = await Promise.all(conversations.map(async (conv) => {
      // Find the other participant
      const otherParticipant = conv.participants.find(
        p => !p.user.equals(userId) || p.userModel !== userModel
      );
      
      if (!otherParticipant) {
        return null;
      }
      
      // Find the other participant's user record
      let otherUser;
      if (otherParticipant.userModel === 'User') {
        otherUser = await User.findById(otherParticipant.user).select('name email phoneNumber university');
      } else {
        otherUser = await Admin.findById(otherParticipant.user).select('name email');
      }
      
      if (!otherUser) {
        return null;
      }
      
      // Get product info if it exists
      let productInfo = null;
      if (conv.productId) {
        // This assumes you have a Product model - adjust as needed
        const Product = mongoose.model('Product');
        productInfo = await Product.findById(conv.productId).select('name price imageUrl');
      }
      
      // Get unread count for current user
      const unreadCount = conv.unreadCount.get(userId.toString()) || 0;
      
      return {
        id: conv._id,
        contactName: otherUser.name,
        contactEmail: otherUser.email,
        contactPhone: otherUser.phoneNumber || '',
        lastMessage: conv.lastMessage,
        timestamp: conv.lastMessageAt,
        unread: unreadCount > 0,
        productInfo: productInfo ? {
          id: productInfo._id,
          name: productInfo.name,
          price: productInfo.price,
          imageUrl: productInfo.imageUrl
        } : null
      };
    }));
    
    // Remove any null entries (where we couldn't find user info)
    const filteredConversations = populatedConversations.filter(conv => conv !== null);
    
    res.json(filteredConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    // Check if the conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': userId
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Get messages for this conversation
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });
    
    // Format messages for the frontend
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      sender: msg.sender.equals(userId) ? 'me' : 'them',
      text: msg.text,
      timestamp: msg.createdAt.toLocaleString(),
      read: msg.read
    }));
    
    // Mark messages as read if they were sent to this user
    await Message.updateMany(
      { 
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );
    
    // Reset unread count for this user in this conversation
    const unreadCountMap = new Map(conversation.unreadCount);
    unreadCountMap.set(userId.toString(), 0);
    conversation.unreadCount = unreadCountMap;
    await conversation.save();
    
    res.json(formattedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// Start a new conversation or get existing one
router.post('/conversations', verifyToken, async (req, res) => {
  try {
    const { recipientId, productId } = req.body;
    const userId = req.user._id;
    const userModel = req.user.isAdmin ? 'Admin' : 'User';
    
    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }
    
    // Get recipient type (User or Admin)
    const recipient = await getUserTypeAndId(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Check if a conversation already exists between these users about this product
    let query = {
      'participants': {
        $all: [
          { $elemMatch: { user: userId, userModel: userModel } },
          { $elemMatch: { user: recipientId, userModel: recipient.model } }
        ]
      }
    };
    
    // If product is specified, add it to the query
    if (productId) {
      query.productId = productId;
    }
    
    let conversation = await Conversation.findOne(query);
    
    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { user: userId, userModel: userModel },
          { user: recipientId, userModel: recipient.model }
        ],
        productId: productId || null,
        unreadCount: new Map([[recipientId.toString(), 0], [userId.toString(), 0]])
      });
      
      await conversation.save();
    }
    
    // Create a system message if it's a new conversation about a product
    if (productId && conversation.isNew) {
      try {
        // Get product info
        const Product = mongoose.model('Product');
        const product = await Product.findById(productId);
        
        if (product) {
          const systemMessage = new Message({
            conversationId: conversation._id,
            sender: userId,
            senderModel: userModel,
            text: `This is the beginning of your conversation about "${product.name}".`,
            read: false
          });
          
          await systemMessage.save();
          
          // Update conversation with this system message
          conversation.lastMessage = systemMessage.text;
          conversation.lastMessageAt = systemMessage.createdAt;
          await conversation.save();
        }
      } catch (error) {
        console.error('Error creating system message:', error);
        // Continue even if system message creation fails
      }
    }
    
    res.status(201).json({
      conversationId: conversation._id,
      isNew: conversation.isNew || false
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error creating conversation' });
  }
});

// Send a message in a conversation
router.post('/conversations/:conversationId/messages', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const userModel = req.user.isAdmin ? 'Admin' : 'User';
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }
    
    // Check if the conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': userId
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Create the message
    const message = new Message({
      conversationId,
      sender: userId,
      senderModel: userModel,
      text: text.trim(),
      read: false
    });
    
    await message.save();
    
    // Update the conversation with the last message info
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = message.createdAt;
    
    // Find the other participant and increment their unread count
    const otherParticipant = conversation.participants.find(
      p => !p.user.equals(userId) || p.userModel !== userModel
    );
    
    if (otherParticipant) {
      const otherUserId = otherParticipant.user.toString();
      const unreadCountMap = new Map(conversation.unreadCount);
      const currentCount = unreadCountMap.get(otherUserId) || 0;
      unreadCountMap.set(otherUserId, currentCount + 1);
      conversation.unreadCount = unreadCountMap;
    }
    
    await conversation.save();
    
    // Return the formatted message
    res.status(201).json({
      id: message._id,
      sender: 'me',
      text: message.text,
      timestamp: message.createdAt.toLocaleString(),
      read: message.read
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

export default router;