import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

// Socket connection using WebSocket only to avoid polling errors
const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

const Messages = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { seller } = state || {};
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Redirect if no seller info is provided
  useEffect(() => {
    if (!seller?.email || !user?.email) {
      navigate('/marketplace');
    }
  }, [seller, user, navigate]);

  // Join user's inbox room
  useEffect(() => {
    if (user?.email) {
      socket.emit('join', user.email);
    }
  }, [user]);

  // Check if we should scroll to bottom (if user is near bottom)
  const checkShouldScrollToBottom = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      // If user is within 100px of bottom, enable auto-scroll
      setShouldScrollToBottom(distanceFromBottom < 100);
    }
  };

  // Scroll to bottom of messages when needed
  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldScrollToBottom]);

  // Add scroll event listener
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkShouldScrollToBottom);
      return () => container.removeEventListener('scroll', checkShouldScrollToBottom);
    }
  }, []);

  // Fetch existing messages and listen for new ones
  useEffect(() => {
    if (!seller?.email || !user?.email) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/messages/conversation/${seller.email}`);
        setMessages(res.data);
        setLoading(false);
        
        // Set initial scroll position after messages load
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
          }
        }, 100);
      } catch (err) {
        console.error('Fetch error:', err);
        setLoading(false);
      }
    };

    fetchMessages();

    // Listen for real-time messages
    const handleNewMessage = (message) => {
      // Check if this message belongs to the current conversation
      const isRelevantMessage = 
        (message.senderEmail === user.email && message.recipientEmail === seller.email) || 
        (message.senderEmail === seller.email && message.recipientEmail === user.email);
        
      if (isRelevantMessage) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('receiveMessage', handleNewMessage);

    return () => {
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [seller, user]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      // Force scroll to bottom when sending a new message
      setShouldScrollToBottom(true);
      
      // Save message to database
      const response = await axios.post('http://localhost:5000/api/messages', {
        recipientEmail: seller.email,
        text: text.trim()
      });

      // Emit message to recipient via socket
      socket.emit('sendMessage', { 
        to: seller.email, 
        message: response.data 
      });

      // Add message to local state
      setMessages(prev => [...prev, response.data]);
      setText('');
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send message');
    }
  };

  // Handle key press events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter creates a new line
        return;
      } else {
        // Just Enter sends the message
        e.preventDefault();
        sendMessage();
      }
    }
  };

  return (
    <div className = "p-6 max-w-2xl mx-auto">
      <h2 className = "text-xl font-bold mb-4">Chat with {seller?.name || seller?.email}</h2>

      <div 
        ref={messageContainerRef}
        className = "bg-gray-100 p-4 rounded h-[400px] overflow-y-auto mb-4"
      >
        {loading ? (
          <div className = "flex items-center justify-center h-full">
            <div className = "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className = "flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 flex ${
                  msg.senderEmail === user.email ? 'justify-end' : 'justify-start'
                }`}
              >
                <span 
                  className={`px-4 py-2 rounded shadow max-w-xs ${
                    msg.senderEmail === user.email 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className = "flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          className = "flex-1 border rounded px-3 py-2 resize-none"
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          rows="2"
        />
        <button
          onClick={sendMessage}
          className = "bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;