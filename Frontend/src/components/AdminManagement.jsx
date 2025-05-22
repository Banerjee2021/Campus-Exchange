import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trash2, Shield, User, MessageCircle } from 'lucide-react';
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
} from './ui/alert-dialog';

const AdminManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  // Fetch all admins and users when component mounts
  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const adminResponse = await axios.get('http://localhost:5000/api/admin');
        setAdmins(adminResponse.data);
        
        const userResponse = await axios.get('http://localhost:5000/api/admin/users');
        setUsers(userResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load users and admins. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate]);

  // Function to initiate chat with a user
  const handleChatWithUser = (selectedUser) => {
    // Navigate to messages page with the selected user as seller (for chat purposes)
    navigate('/messages', {
      state: {
        seller: {
          name: selectedUser.name,
          email: selectedUser.email,
          _id: selectedUser._id
        },
        // No product info since this is admin-initiated chat
        product: null
      }
    });
  };

  // Function to delete a user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      // Update the users list after deletion
      setUsers(users.filter(u => u._id !== userId));
      setDeleteSuccess('User deleted successfully. Their marketplace items have also been removed.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Function to delete an admin
  const handleDeleteAdmin = async (adminId) => {
    // Prevent admins from deleting themselves
    if (adminId === user._id) {
      setError("You cannot delete your own admin account!");
      setTimeout(() => {
        setError(null);
      }, 3000);
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/${adminId}`);
      // Update the admins list after deletion
      setAdmins(admins.filter(a => a._id !== adminId));
      setDeleteSuccess('Admin deleted successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting admin:', err);
      setError('Failed to delete admin. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className = "container mx-auto px-4 py-24">
        <div className = "text-center">
          <div className = "spinner-border text-purple-600" role="status">
            <span className = "sr-only">Loading...</span>
          </div>
          <p className = "mt-2">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className = "container mx-auto px-4 py-24">
      <h1 className = "text-3xl font-bold mb-8 text-center">User Management</h1>
      
      {/* Success/Error message */}
      {deleteSuccess && (
        <div className = "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {deleteSuccess}
        </div>
      )}
      
      {error && (
        <div className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Admin list */}
      <div className = "mb-12">
        <h2 className = "text-2xl font-semibold mb-4 flex items-center">
          <Shield className = "mr-2" /> Admin Accounts ({admins.length})
        </h2>
        <div className = "bg-white shadow-md rounded-lg overflow-hidden">
          <table className = "min-w-full divide-y divide-gray-200">
            <thead className = "bg-gray-50">
              <tr>
                <th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className = "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className = "bg-white divide-y divide-gray-200">
              {admins.map(admin => (
                <tr key={admin._id} className = "hover:bg-gray-50">
                  <td className = "px-6 py-4 whitespace-nowrap">
                    <div className = "flex items-center">
                      <Shield size={16} className = "mr-2 text-purple-600" />
                      <div className = "font-medium text-gray-900">{admin.name}</div>
                    </div>
                  </td>
                  <td className = "px-6 py-4 whitespace-nowrap text-gray-500">{admin.email}</td>
                  <td className = "px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className = "px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer ${
                            admin._id === user._id ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={admin._id === user._id}
                        >
                          <Trash2 size={16} className = "mr-1" />
                          Delete
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Admin Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {admin.name}'s admin account? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAdmin(admin._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="4" className = "px-6 py-4 text-center text-gray-500">
                    No admin accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* User list */}
      <div>
        <h2 className = "text-2xl font-semibold mb-4 flex items-center">
          <User className = "mr-2" /> User Accounts ({users.length})
        </h2>
        <div className = "bg-white shadow-md rounded-lg overflow-hidden">
          <table className = "min-w-full divide-y divide-gray-200">
            <thead className = "bg-gray-50">
              <tr>
                <th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                <th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                <th className = "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className = "bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id} className = "hover:bg-gray-50">
                  <td className = "px-6 py-4 whitespace-nowrap">
                    <div className = "flex items-center">
                      <User size={16} className = "mr-2 text-gray-500" />
                      <div className = "font-medium text-gray-900">{user.name}</div>
                    </div>
                  </td>
                  <td className = "px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                  <td className = "px-6 py-4 whitespace-nowrap text-gray-500">{user.university || '-'}</td>
                  <td className = "px-6 py-4 whitespace-nowrap text-gray-500">{user.phoneNumber || '-'}</td>
                  <td className = "px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className = "px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className = "flex items-center justify-end space-x-2">
                      {/* Chat Button */}
                      <button
                        onClick={() => handleChatWithUser(user)}
                        className = "inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                        title={`Chat with ${user.name}`}
                      >
                        <MessageCircle size={16} className = "mr-1" />
                        Chat
                      </button>
                      
                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className = "inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer transition-colors">
                            <Trash2 size={16} className = "mr-1" />
                            Delete
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.name}'s account? This will also remove all their marketplace listings. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className = "px-6 py-4 text-center text-gray-500">
                    No user accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;