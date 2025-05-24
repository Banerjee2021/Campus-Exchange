import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGoogleSignupDialog, setShowGoogleSignupDialog] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular'
          }
        );
      }
    };

    // Check if Google API is loaded
    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google API to load
      const checkGoogleAPI = setInterval(() => {
        if (window.google && window.google.accounts) {
          initializeGoogleSignIn();
          clearInterval(checkGoogleAPI);
        }
      }, 100);

      // Cleanup interval after 10 seconds if Google API doesn't load
      setTimeout(() => clearInterval(checkGoogleAPI), 10000);
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      setError('');
      
      const result = await googleLogin(response.credential);
      
      if (result.success) {
        setShowSuccess(true);
      } else {
        // Check if user needs to register
        if (result.message && result.message.includes('No account found')) {
          // Decode the JWT to get user info for registration
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          setGoogleUserData({
            name: payload.name,
            email: payload.email,
            googleId: payload.sub,
            picture: payload.picture,
            credential: response.credential
          });
          setShowGoogleSignupDialog(true);
        } else {
          setError(result.message || 'Google sign-in failed');
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('An error occurred during Google sign-in');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(formData.email, formData.password);
    if (result.success) {
      setShowSuccess(true);
    } else {
      setError(result.message);
    }
  };

  const handleGoogleSignupRedirect = () => {
    setShowGoogleSignupDialog(false);
    // Navigate to signup page with Google user data
    navigate('/signup', { 
      state: { 
        googleUser: googleUserData 
      } 
    });
  };

  return (
    <div className = "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className = "max-w-md w-full space-y-8">
        <div>
          <h2 className = "mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className = "mt-6">
          <div className = "relative">
            <div className = "absolute inset-0 flex items-center">
              <div className = "w-full border-t border-gray-300" />
            </div>

            <div className = "mt-8 mb-20">
              <div id="google-signin-button" className = "w-full flex justify-center"></div>
            </div>

            <div className = "relative flex justify-center text-sm">
              <span className = "px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>
          
        </div>

        <form className = "mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className = "rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className = "sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className = "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className = "sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className = "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
            >
              Sign in
            </button>
          </div>

          <div className = "text-sm text-center">
            <Link to="/signup" className = "font-medium text-purple-600 hover:text-purple-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              You have successfully logged in to your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => navigate('/')}
              className = "bg-[#1E90FF] hover:bg-[#1E90FF]/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Google Signup Required Dialog */}
      <AlertDialog open={showGoogleSignupDialog} onOpenChange={setShowGoogleSignupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Not Found</AlertDialogTitle>
            <AlertDialogDescription>
              We couldn't find an account associated with your Google account. 
              Would you like to create a new account with your Google information?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className = "flex gap-2">
            <AlertDialogAction 
              onClick={() => setShowGoogleSignupDialog(false)}
              className = "bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={handleGoogleSignupRedirect}
              className = "bg-[#1E90FF] hover:bg-[#1E90FF]/90"
            >
              Sign Up
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Login;