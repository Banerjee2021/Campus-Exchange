import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Delete, Trash2 } from 'lucide-react';
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
} from '../components/ui/alert-dialog'

const Profile = () => {
  const { user, deleteAccount, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      fetchUserProducts();
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
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Marketplace Uploads</h3>
        {products.length === 0 ? (
          <p className="text-gray-500">No uploads yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img 
                  src={`http://localhost:5000${product.imageUrl}`} 
                  alt={product.productName} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-xl font-semibold mb-2">{product.productName}</h4>
                  <p className="text-gray-600 mb-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-purple-600">${product.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">{product.productType}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>Seller: {product.sellerName}</span>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        onClick={() => openDeleteConfirmation(product._id)}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
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
            ))}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Library Uploads</h3>
        <p className="text-gray-500">No uploads yet.</p>
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
              <Delete size={20} />
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
    </div>
  );
};

export default Profile;