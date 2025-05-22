import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/profile');
      setUser(response.data);
      setIsAdmin(response.data.isAdmin || false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Try to login as a regular user first
      const userResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = userResponse.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAdmin(user.isAdmin || false);
      return { success: true };
    } catch (userError) {
      // If user login fails, try admin login
      try {
        const adminResponse = await axios.post('http://localhost:5000/api/admin/login', {
          email,
          password
        });
        
        const { token, admin } = adminResponse.data;
        const adminUser = { ...admin, isAdmin: true };
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(adminUser);
        setIsAdmin(true);
        return { success: true };
      } catch (adminError) {
        console.error('Login error:', userError.response?.data, adminError.response?.data);
        return {
          success: false,
          message: userError.response?.data?.message || 'Login failed'
        };
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAdmin(false);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAdmin(false);
  };

  const deleteAccount = async () => {
    try {
      if (!user || !user._id) {
        return {
          success: false,
          message: 'No user found to delete'
        };
      }
      
      const response = await axios.delete('http://localhost:5000/api/users/delete');
      
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAdmin(false);
      
      return { 
        success: true,
        message: 'Account successfully deleted.',
        data: response.data
      };
    } catch (error) {
      console.error('Full Deletion Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
  
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account',
        error: error.response?.data
      };
    }
  };

  // New method to check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    return !!token && user !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      login,
      register,
      logout,
      deleteAccount,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};