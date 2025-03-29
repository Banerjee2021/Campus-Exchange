import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Send,
  User,
  ArrowLeft,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const MessagingSystem = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle incoming data from Marketplace component
  useEffect(() => {
    if (location.state?.seller) {
      const { seller, product } = location.state;

      // Create a conversation object from the seller info
      const newConversation = {
        id: seller.id || `seller-${Date.now()}`,
        contactName: seller.name,
        contactEmail: seller.email,
        contactPhone: seller.contact,
        productInfo: product,
        lastMessage: "",
        timestamp: "Just now",
        unread: false,
      };

      // Check if conversation with this seller already exists
      const existingConvIndex = conversations.findIndex(
        (conv) =>
          conv.contactEmail === seller.email &&
          (conv.productInfo?.id === product.id || !conv.productInfo)
      );

      if (existingConvIndex === -1) {
        // Add new conversation
        setConversations((prevConversations) => [
          newConversation,
          ...prevConversations,
        ]);
        // Select this conversation
        setSelectedConversation(newConversation);

        // Initialize with a contextual welcome message about the product
        setMessages([
          {
            id: Date.now(),
            sender: "system",
            text: `This is the beginning of your conversation about "${product.name}".`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        // Select existing conversation
        setSelectedConversation(conversations[existingConvIndex]);
      }
    }
  }, [location.state]);

  // Initialize with default conversations if none exist
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/messaging/conversations');
        // Ensure response.data is an array
        const conversationsData = Array.isArray(response.data) ? response.data : [];
        setConversations(conversationsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        // If error occurs, ensure conversations is still an array
        setConversations([]);
        setLoading(false);
      }
    };
  
    fetchConversations();
  }, []);

  useEffect(() => {
    // Load messages when a conversation is selected
    if (selectedConversation) {
      setLoading(true);
      
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/api/messaging/conversations/${selectedConversation.id}/messages`);
          // Ensure response.data is an array
          const messagesData = Array.isArray(response.data) ? response.data : [];
          setMessages(messagesData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching messages:", error);
          // If error occurs, ensure messages is still an array
          setMessages([]);
          setLoading(false);
        }
      };
      
      fetchMessages();
    }
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
  
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMessage = {
      id: Date.now(), // Temporary ID
      sender: "me",
      text: message,
      timestamp: "Just now",
    };
  
    // Add message to UI immediately for better UX
    setMessages([...messages, newMessage]);
    
    // Clear the input field
    const messageToSend = message;
    setMessage("");
    
    try {
      // Send to API
      const response = await axios.post(`/api/messaging/conversations/${selectedConversation.id}/messages`, {
        text: messageToSend
      });
      
      // Update conversation list with the latest message
      setConversations(prevConversations => {
        // Ensure prevConversations is an array
        const conversationsList = Array.isArray(prevConversations) ? prevConversations : [];
        
        const updatedConversations = conversationsList.map(conv => 
          conv.id === selectedConversation.id 
            ? {...conv, lastMessage: messageToSend, timestamp: currentTime} 
            : conv
        );
        
        // Move this conversation to the top
        const currentConvIndex = updatedConversations.findIndex(conv => conv.id === selectedConversation.id);
        if (currentConvIndex > 0) {
          const [current] = updatedConversations.splice(currentConvIndex, 1);
          updatedConversations.unshift(current);
        }
        
        return updatedConversations;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle the error - maybe show an error state for the message
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-4 border border-gray-200">
          <div className="flex h-[calc(100vh-120px)]">
            {/* Sidebar - Conversation List */}
            <div
              className={`w-1/3 border-r border-gray-200 ${
                selectedConversation && "hidden md:block"
              }`}
            >
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Messages
                </h2>
                <div className="mt-2 relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-230px)]">
                {Array.isArray(conversations) && conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                        selectedConversation?.id === conversation.id
                          ? "bg-purple-50"
                          : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-full text-white mr-3">
                          <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-sm font-medium truncate">
                              {conversation.contactName}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.timestamp}
                            </span>
                          </div>
                          {conversation.productInfo && (
                            <div className="flex items-center text-xs text-purple-600 mb-1">
                              <ShoppingBag size={12} className="mr-1" />
                              <span className="truncate">
                                Re: {conversation.productInfo.name}
                              </span>
                            </div>
                          )}
                          <p
                            className={`text-sm truncate ${
                              conversation.unread
                                ? "font-medium text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {conversation.lastMessage || "Start a conversation"}
                          </p>
                        </div>
                        {conversation.unread && (
                          <div className="ml-2 bg-purple-600 rounded-full w-2.5 h-2.5"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {loading ? "Loading conversations..." : "No conversations yet"}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content - Messages */}
            {selectedConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <button
                      className="md:hidden mr-2 text-gray-600 hover:text-gray-900"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-full text-white mr-3">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {selectedConversation.contactName}
                      </h3>
                      {selectedConversation.productInfo && (
                        <p className="text-xs text-purple-600">
                          Re: {selectedConversation.productInfo.name} ($
                          {selectedConversation.productInfo.price?.toFixed(2)})
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Usually replies within 1 hour
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                      <Phone size={20} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                      <Info size={20} />
                    </button>
                  </div>
                </div>

                {/* Product Info Banner (if from marketplace) */}
                {selectedConversation.productInfo && (
                  <div className="bg-purple-50 p-3 flex items-center border-b border-purple-100">
                    <div className="h-12 w-12 rounded overflow-hidden mr-3 flex-shrink-0">
                      {selectedConversation.productInfo.imageUrl && (
                        <img
                          src={`http://localhost:5000${selectedConversation.productInfo.imageUrl}`}
                          alt={selectedConversation.productInfo.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {selectedConversation.productInfo.name}
                      </h4>
                      <p className="text-sm text-purple-700 font-bold">
                        ${selectedConversation.productInfo.price?.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        navigate(
                          `/product/${selectedConversation.productInfo.id}`
                        )
                      }
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700"
                    >
                      View
                    </button>
                  </div>
                )}

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {loading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      {Array.isArray(messages) && messages.length > 0 ? (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender === "me"
                                ? "justify-end"
                                : msg.sender === "system"
                                ? "justify-center"
                                : "justify-start"
                            }`}
                          >
                            {msg.sender === "system" ? (
                              <div className="bg-gray-200 text-gray-600 rounded-lg px-4 py-2 text-xs max-w-xs text-center">
                                {msg.text}
                              </div>
                            ) : (
                              <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                                  msg.sender === "me"
                                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                <p className="text-sm">{msg.text}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    msg.sender === "me"
                                      ? "text-purple-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {msg.timestamp}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 mt-4">
                          No messages yet. Start a conversation!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end">
                    <textarea
                      className="flex-1 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Type a message..."
                      rows="3"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                    ></textarea>
                    <button
                      className={`ml-2 p-3 rounded-full ${
                        message.trim() === ""
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-md"
                      }`}
                      onClick={handleSendMessage}
                      disabled={message.trim() === ""}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center p-6">
                  <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageCircle size={32} className="text-purple-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-1">
                    Your Messages
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;