import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, User, Mail, Phone, X, FileText } from 'lucide-react';
import axios from 'axios';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '../components/ui/alert-dialog';

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


const Profile = () => {
  const { user, deleteAccount, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [libraryItems, setLibraryItems] = useState([]);
  const [libraryItemToDelete, setLibraryItemToDelete] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      fetchUserProducts();
      fetchUserLibraryItems();
    }
  }, [user, loading, navigate]);

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount();
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to delete account. Please try again.');
    }
  };

  const fetchUserProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/user');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching user products:', error);
      setError('Failed to fetch products');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${productToDelete}`);
      // Remove the deleted product from the local state
      setProducts(products.filter(product => product._id !== productToDelete));
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };

  const openDeleteConfirmation = (productId) => {
    setProductToDelete(productId);
  };
  const fetchUserLibraryItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/library/all');
      // Filter library items to only show those uploaded by the current user
      const userLibraryItems = response.data.filter(item => item.userEmail === user.email);
      setLibraryItems(userLibraryItems);
    } catch (error) {
      console.error('Error fetching library items:', error);
      setError('Failed to fetch library items');
    }
  };


  const handleDeleteLibraryItem = async () => {
    if (!libraryItemToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/library/${libraryItemToDelete}`);
      // Remove the deleted library item from the local state
      setLibraryItems(libraryItems.filter(item => item._id !== libraryItemToDelete));
      setLibraryItemToDelete(null);
    } catch (error) {
      console.error('Error deleting library item:', error);
      setError('Failed to delete library item');
    }
  };

  const openLibraryItemDeleteConfirmation = (libraryItemId) => {
    setLibraryItemToDelete(libraryItemId);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">

    {zoomedImage && (
        <ZoomedImage 
          imageUrl={`http://localhost:5000${zoomedImage}`}
          productName="Zoomed Product"
          onClose={() => setZoomedImage(null)}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button 
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors cursor-pointer"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                This will sign you out of your account and return you to the home page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <p className="mt-1 text-sm text-gray-500">Your account information.</p>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">University</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.university}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.phoneNumber}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg  text-gray-900 mb-12 font-extrabold">Marketplace Uploads</h3>
        {products.length === 0 ? (
          <p className="text-gray-500">No uploads yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
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

                  <div className="mb-4 border-t pt-4">
                    <div className="flex items-center mb-2">
                      <User className="mr-2 text-gray-500" size={20} />
                      <span className="text-sm text-gray-700">{product.sellerName}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <Mail className="mr-2 text-gray-500" size={20} />
                      <span className="text-sm text-gray-700">{product.sellerEmail}</span>
                    </div>

                    <div className="flex items-center mb-4">
                      <Phone className="mr-2 text-gray-500" size={20} />
                      <span className="text-sm text-gray-700">{product.sellerContact}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          onClick={() => openDeleteConfirmation(product._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                          Delete Product
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The product will be permanently deleted from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteProduct}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Product
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-extrabold text-gray-900 mb-6">Library Uploads</h3>
        {libraryItems.length === 0 ? (
          <p className="text-gray-500">No library uploads yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraryItems.map((item, index) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-purple-500" size={24} />
                      <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {item.semester}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>

                  <div className="flex gap-4 mt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          onClick={() => openLibraryItemDeleteConfirmation(item._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                          Delete File
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The file will be permanently deleted from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteLibraryItem}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete File
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Messages</h3>
        <p className="text-gray-500">No messages yet.</p>
      </div>

      <div className="mt-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="text-red-600 hover:text-red-800 font-medium cursor-pointer flex gap-x-2"
            >
              <Trash2 size={20} />
              Delete Account
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Your account will be permanently deleted from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

export default Profile;