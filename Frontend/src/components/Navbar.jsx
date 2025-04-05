import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingBag, User, Home, ChevronDown, LogOut, Shield, MessageCircle, Users, Menu, X } from 'lucide-react';
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
  const { user, logout, isAdmin } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMouseOverProfile, setIsMouseOverProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close profile dropdown after delay when mouse leaves
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }

    // Add event listener when menu is open
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle window resize to close mobile menu on larger screens
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Custom logout handler to close dropdown
  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    logout();
  };

  return (
    <>
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
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
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
              
              {/* Admin Management link that only shows for admin users */}
              {user && isAdmin && (
                <Link to="/admin/manage" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
                  <Users size={20} />
                  <span>Manage Users</span>
                </Link>
              )}
              
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
                    {isAdmin ? <Shield size={20} /> : <User size={20} />}
                    <span>{isAdmin ? 'Admin Profile' : 'Profile'}</span>
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
                        {isAdmin ? <Shield size={16} /> : <User size={16} />}
                        <span>{isAdmin ? 'Admin Dashboard' : 'Go to Profile'}</span>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
                          >
                            <LogOut size={16} />
                            <span>Log Out</span>
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
                            <AlertDialogAction onClick={handleLogout}>
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
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-purple-600 transition-colors focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay and Mobile Menu moved outside the nav element */}
      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.65)] bg-opacity-50 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Menu - z-index higher than overlay */}
      <div 
        ref={mobileMenuRef}
        className={`fixed lg:hidden top-16 inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 h-full ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-4 space-y-4">
          <Link 
            to="/"
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors py-2 border-b border-gray-100"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link 
            to="/marketplace"
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors py-2 border-b border-gray-100"
          >
            <ShoppingBag size={20} />
            <span>Marketplace</span>
          </Link>
          <Link 
            to="/library"
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors py-2 border-b border-gray-100"
          >
            <BookOpen size={20} />
            <span>Library</span>
          </Link>
          
          {user && isAdmin && (
            <Link 
              to="/admin/manage"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors py-2 border-b border-gray-100"
            >
              <Users size={20} />
              <span>Manage Users</span>
            </Link>
          )}
          
          {user ? (
            <>
              <Link 
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors py-2 border-b border-gray-100"
              >
                {isAdmin ? <Shield size={20} /> : <User size={20} />}
                <span>{isAdmin ? 'Admin Dashboard' : 'Go to Profile'}</span>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors py-2"
                  >
                    <LogOut size={20} />
                    <span>Log Out</span>
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
                    <AlertDialogAction onClick={handleLogout}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Link 
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors py-2"
            >
              <User size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;