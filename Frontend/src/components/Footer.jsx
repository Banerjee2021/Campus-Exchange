import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github as GitHub } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../components/ui/alert-dialog';

const Footer = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [showSignupDialog, setShowSignupDialog] = React.useState(false);

  const handleLoginClick = (e) => {
    // If user is logged in, prevent default navigation and show dialog
    if (checkAuth()) {
      e.preventDefault();
      setShowLoginDialog(true);
    }
    // If not logged in, let the default Link behavior work
  };

  const handleSignupClick = (e) => {
    // If user is logged in, prevent default navigation and show dialog
    if (checkAuth()) {
      e.preventDefault();
      setShowSignupDialog(true);
    }
    // If not logged in, let the default Link behavior work
  };

  const handleContinue = () => {
    // Redirect to profile page
    navigate('/profile');
    // Close both dialogs
    setShowLoginDialog(false);
    setShowSignupDialog(false);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CampusXchange</h3>
            <p className="text-gray-400">
              Your one-stop platform for campus commerce and knowledge sharing.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/marketplace" className="text-gray-400 hover:text-white">Marketplace</Link></li>
              <li><Link to="/library" className="text-gray-400 hover:text-white">Library</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-400 hover:text-white"
                  onClick={handleLoginClick}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  className="text-gray-400 hover:text-white"
                  onClick={handleSignupClick}
                >
                  Sign Up
                </Link>
              </li>
              <li><Link to="/profile" className="text-gray-400 hover:text-white">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram /></a>
              <a href="#" className="text-gray-400 hover:text-white"><GitHub /></a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} CampusXchange. All rights reserved.
          </p>
        </div>
      </div>

      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Already Logged In</AlertDialogTitle>
            <AlertDialogDescription>
              You are currently logged in, log out before trying to login any other user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleContinue}
              className="bg-blue-500 hover:bg-blue-600" // Dodgerblue style
            >
              Continue to Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Signup Alert Dialog */}
      <AlertDialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Already Logged In</AlertDialogTitle>
            <AlertDialogDescription>
              You are currently logged in, log out before trying to signup any other user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleContinue}
              className="bg-blue-500 hover:bg-blue-600" // Dodgerblue style
            >
              Continue to Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx>{`
        .bg-blue-500 {
          background-color: #1E90FF; /* Dodgerblue */
        }
        .hover\:bg-blue-600:hover {
          background-color: #1a7ae7; /* Slightly darker dodgerblue for hover */
        }
      `}</style>
    </footer>
  );
};

export default Footer;