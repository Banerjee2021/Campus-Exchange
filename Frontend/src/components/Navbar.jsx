import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingBag, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                CampusXchange
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link to="/marketplace" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
              <ShoppingBag size={20} />
              <span>Marketplace</span>
            </Link>
            <Link to="/library" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
              <BookOpen size={20} />
              <span>Library</span>
            </Link>
            <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
              <User size={20} />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;