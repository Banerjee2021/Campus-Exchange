import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { checkAuth, loading } = useAuth();

  if (loading) {
    return (
      <div className = "min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className = "w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!checkAuth()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;