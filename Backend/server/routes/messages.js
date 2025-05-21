import express from 'express';
import Message from '../models/Message.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate a consistent conversation ID between two users
function generateConversationId(user1, user2) {
  // Sort emails alphabetically to ensure consistency
  const sortedEmails = [user1, user2].sort();
  return `${sortedEmails[0]}:${sortedEmails[1]}`;
}

// Send a message
router.post('/', verifyToken, async (req, res) => {
  const { recipientEmail, text } = req.body;
  const senderEmail = req.user.email;

  if (!recipientEmail || !text) {
    return res.status(400).json({ message: 'recipientEmail and text are required' });
  }

  try {
    // Generate a consistent conversation ID for these two users
    const conversationId = generateConversationId(senderEmail, recipientEmail);

    const message = await Message.create({
      conversationId,
      senderEmail,
      text,
    });

    // Return created message
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Message send error', error: err.message });
  }
});

// Get messages for a specific conversation with another user
router.get('/conversation/:otherUserEmail', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const otherUserEmail = req.params.otherUserEmail;
    
    // Generate conversation ID
    const conversationId = generateConversationId(userEmail, otherUserEmail);
    
    // Find all messages in this conversation
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }); // Sort by oldest first for chat display
    
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Fetch messages failed', error: err.message });
  }
});

// Get all unique conversations for the current user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Find all messages where the user is either sender or recipient
    // (by looking at their conversationIds that include their email)
    const messages = await Message.find({
      conversationId: { $regex: userEmail }
    }).sort({ createdAt: -1 });
    
    // Extract unique conversation partners
    const conversations = {};
    
    messages.forEach(message => {
      // Get the other user's email from the conversationId
      const [email1, email2] = message.conversationId.split(':');
      const otherUserEmail = email1 === userEmail ? email2 : email1;
      
      // If we haven't processed this conversation yet
      if (!conversations[otherUserEmail]) {
        // Find the most recent message
        const latestMessage = messages
          .filter(msg => msg.conversationId === message.conversationId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          
        conversations[otherUserEmail] = {
          email: otherUserEmail,
          latestMessage
        };
      }
    });
    
    // Convert to array and sort by latest message
    const result = Object.values(conversations)
      .sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));
      
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Fetch conversations failed', error: err.message });
  }
});

export default router;