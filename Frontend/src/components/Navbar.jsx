import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingBag, User, Home, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMouseOverProfile, setIsMouseOverProfile] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (!isMouseOverProfile) {
      timeoutId = setTimeout(() => {
        setIsProfileDropdownOpen(false);
      }, 750);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isMouseOverProfile]);

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
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link to="/marketplace" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
              <ShoppingBag size={20} />
              <span>Marketplace</span>
            </Link>
            <Link to="/library" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
              <BookOpen size={20} />
              <span>Library</span>
            </Link>
            
            {user ? (
              <div 
                className="relative"
                onMouseEnter={() => {
                  setIsProfileDropdownOpen(true);
                  setIsMouseOverProfile(true);
                }}
                onMouseLeave={() => {
                  setIsMouseOverProfile(false);
                }}
              >
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <User size={20} />
                  <span>Profile</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-450 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </Link>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <User size={16} />
                      <span>Go to Profile</span>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will log you out of your account and return you to the home page.
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
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
                <User size={20} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;