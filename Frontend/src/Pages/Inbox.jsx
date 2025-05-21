import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import { Loader2 } from 'lucide-react';

const socket = io('http://localhost:5000', {
  transports: ['websocket'], // Use WebSocket only to avoid polling errors
});

const Inbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    // Join socket room with user's email to receive new messages
    socket.emit('join', user.email);

    // Fetch all conversations
    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // Get all conversations for the current user
        const response = await axios.get('http://localhost:5000/api/messages/conversations');
        
        setConversations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setLoading(false);
      }
    };

    fetchConversations();

    // Listen for new messages
    socket.on('receiveMessage', (newMsg) => {
      // Refresh conversations when a new message is received
      fetchConversations();
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [user]);

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Inbox</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const { email: otherUserEmail, latestMessage } = conversation;
            const timestamp = new Date(latestMessage?.createdAt).toLocaleString();
            const isFromMe = latestMessage?.senderEmail === user?.email;
            
            return (
              <Link 
                key={otherUserEmail}
                to="/messages" 
                state={{ seller: { email: otherUserEmail, name: otherUserEmail } }}
                className="block"
              >
                <div className="bg-white shadow rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{otherUserEmail}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {isFromMe ? 'You: ' : ''}{truncateText(latestMessage?.text || 'No messages')}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">{timestamp}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inbox;