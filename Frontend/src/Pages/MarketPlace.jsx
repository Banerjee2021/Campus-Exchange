import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2, Search, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ZoomedImage = ({ imageUrl, productName, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors cursor-pointer"
        >
          <X size={30} />
        </button>
        <img
          src={imageUrl}
          alt={productName}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

const Marketplace = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    // Check authentication before fetching products
    if (!checkAuth()) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      // Redirect to login if there's an unauthorized error
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleMessageSeller = (sellerContact) => {
    // Check authentication before messaging
    if (!checkAuth()) {
      navigate('/login');
      return;
    }
    console.log(`Messaging seller at: ${sellerContact}`);
  };

  const handleImageZoom = (imageUrl) => {
    // Check authentication before zooming
    if (!checkAuth()) {
      navigate('/login');
      return;
    }
    setZoomedImage(imageUrl);
  };

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {zoomedImage && (
        <ZoomedImage 
          imageUrl={`http://localhost:5000${zoomedImage}`}
          productName="Zoomed Product"
          onClose={() => setZoomedImage(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600 mb-8">Discover amazing products from our community</p>

        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by category (e.g. Electronics, Books, etc.)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => navigate('/post-item')}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Post Item
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full">No products found</p>
          ) : (
            filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
                }}
              >
                <div 
                  className="aspect-w-16 aspect-h-9 cursor-zoom-in"
                  onClick={() => handleImageZoom(product.imageUrl)}
                >
                  <img
                    src={`http://localhost:5000${product.imageUrl}`}
                    alt={product.productName}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{product.productName}</h2>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {product.productType}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleMessageSeller(product.sellerContact)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
                  >
                    <MessageCircle size={20} />
                    Message Seller
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Marketplace;