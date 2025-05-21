import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String, // Will store a consistent ID for a conversation between two users (email1:email2)
      required: true,
      index: true // Add index for better query performance
    },
    senderEmail: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);