import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { LucideIndianRupee } from 'lucide-react';

// Socket connection using WebSocket only to avoid polling errors
const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

const Messages = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { seller, product } = state || {};
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [scrollToLastMessage, setScrollToLastMessage] = useState(false);

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

  // Scroll to bottom of messages when needed or to last message when sending
  useEffect(() => {
    if (scrollToLastMessage && lastMessageRef.current) {
      // Scroll to the top of the last message when user sends a message
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setScrollToLastMessage(false);
    } else if (messagesEndRef.current && shouldScrollToBottom) {
      // Normal scroll to bottom behavior
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldScrollToBottom, scrollToLastMessage]);

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
        // If it's a message from the other user, scroll to bottom normally
        if (message.senderEmail !== user.email) {
          setShouldScrollToBottom(true);
        }
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
      // Set flag to scroll to the last message (not bottom) when sending
      setScrollToLastMessage(true);
      setShouldScrollToBottom(false);
      
      // Prepare message data with product info if available
      const messageData = {
        recipientEmail: seller.email,
        text: text.trim(),
        // Include product info only for the first message if product exists
        ...(product && messages.length === 0 && {
          productInfo: {
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            type: product.type
          }
        })
      };
      
      // Save message to database
      const response = await axios.post('http://localhost:5000/api/messages', messageData);

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
        className = "bg-gray-100 p-4 rounded h-[400px] overflow-y-auto overflow-x-hidden mb-4"
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
                ref={i === messages.length - 1 ? lastMessageRef : null}
                className={`mb-2 flex ${
                  msg.senderEmail === user.email ? 'justify-end' : 'justify-start'
                }`}
              >
                <div 
                  className={`px-4 py-2 rounded shadow max-w-xs break-words overflow-wrap-anywhere ${
                    msg.senderEmail === user.email 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Product Highlight - show if product info is available OR if first message has product info */}
      {(product || (messages.length > 0 && messages[0].productInfo)) && (
        <div className = "bg-purple-50 border-l-4 border-purple-500 p-4 mb-4 rounded-r-lg">
          <div className = "flex items-start space-x-4">
            {(product?.imageUrl || messages[0]?.productInfo?.imageUrl) && (
              <img 
                src={`http://localhost:5000${product?.imageUrl || messages[0]?.productInfo?.imageUrl}`} 
                alt={product?.name || messages[0]?.productInfo?.name}
                className = "w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className = "flex-1 min-w-0">
              <h3 className = "font-semibold text-purple-900 text-lg break-words">
                {product?.name || messages[0]?.productInfo?.name}
              </h3>
              <div className = "flex items-center text-purple-700 font-medium mt-1">
                <LucideIndianRupee size={16} />
                <span>{(product?.price || messages[0]?.productInfo?.price)?.toFixed(2)}</span>
              </div>
              {(product?.type || messages[0]?.productInfo?.type) && (
                <span className = "inline-block bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full mt-2">
                  {product?.type || messages[0]?.productInfo?.type}
                </span>
              )}
            </div>
          </div>
          <p className = "text-purple-700 text-sm mt-2 italic">
            {product ? "You're inquiring about this product" : "Product inquiry"}
          </p>
        </div>
      )}

      <div className = "flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          className = "flex-1 border rounded px-3 py-2 resize-none min-w-0"
          placeholder={
            product ? `Ask about ${product.name}... (Enter to send, Shift+Enter for new line)` : 
            (messages.length > 0 && messages[0].productInfo) ? `Ask about ${messages[0].productInfo.name}... (Enter to send, Shift+Enter for new line)` :
            "Type your message... (Enter to send, Shift+Enter for new line)"
          }
          rows="2"
        />
        <button
          onClick={sendMessage}
          className = "bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors flex-shrink-0 cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;