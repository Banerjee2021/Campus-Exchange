import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebase';

const Signup = () => {
  const [step, setStep] = useState('email'); // 'email', 'verification', 'details'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const { register, googleRegister } = useAuth();
  const navigate = useNavigate();

  // Check if user is returning from email verification
  useEffect(() => {
    const checkEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }

        try {
          await signInWithEmailLink(auth, email, window.location.href);
          localStorage.setItem('emailVerified', 'true');
          localStorage.setItem('verifiedEmail', email);
          localStorage.removeItem('emailForSignIn');
          
          setEmailVerified(true);
          setFormData(prev => ({ ...prev, email }));
          setStep('details');
        } catch (error) {
          console.error('Error verifying email:', error);
          setError('Error verifying email. Please try again.');
        }
      }

      // Check if email was already verified in this session
      const isVerified = localStorage.getItem('emailVerified');
      const verifiedEmail = localStorage.getItem('verifiedEmail');
      if (isVerified && verifiedEmail) {
        setEmailVerified(true);
        setFormData(prev => ({ ...prev, email: verifiedEmail }));
        setStep('details');
      }
    };

    checkEmailLink();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/signup',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);
      
      // Save email in localStorage for verification
      localStorage.setItem('emailForSignIn', formData.email);
      
      setStep('verification');
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    setIsLoading(true);

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/signup',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);
      alert('Verification email resent successfully!');
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailVerified) {
      setError('Please verify your email before continuing');
      return;
    }

    // Validate all fields
    if (!formData.name || !formData.password || !formData.university || !formData.phoneNumber) {
      setError('All fields are required');
      return;
    }

    // Password length validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    const result = await register(formData);
    if (result.success) {
      // Clear email verification flags
      localStorage.removeItem('emailVerified');
      localStorage.removeItem('verifiedEmail');
      setShowSuccess(true);
    } else {
      setError(result.message);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      setGoogleUserData({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture
      });
      
      setShowGoogleForm(true);
    } catch (error) {
      console.error('Error decoding Google credential:', error);
      setError('Failed to process Google authentication');
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  const handleGoogleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.university || !formData.phoneNumber) {
      setError('University and phone number are required');
      return;
    }

    // Phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    const googleRegistrationData = {
      ...googleUserData,
      university: formData.university,
      phoneNumber: formData.phoneNumber
    };

    const result = await googleRegister(googleRegistrationData);
    if (result.success) {
      setShowSuccess(true);
      setShowGoogleForm(false);
    } else {
      setError(result.message);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setFormData({ ...formData, email: '' });
    localStorage.removeItem('emailForSignIn');
    localStorage.removeItem('emailVerified');
    localStorage.removeItem('verifiedEmail');
    setEmailVerified(false);
  };

  // Email verification step
  if (step === 'verification') {
    return (
      <div className = "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className = "max-w-md w-full space-y-8">
          <div>
            <h2 className = "mt-6 text-center text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className = "mt-2 text-center text-sm text-gray-600">
              We've sent a verification link to <strong>{formData.email}</strong>
            </p>
            <p className = "mt-2 text-center text-sm text-gray-600">
              Click the link in your email to verify your account and continue with signup.
            </p>
          </div>

          {error && (
            <div className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className = "space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={isLoading}
              className = "w-full py-2 px-4 border border-purple-600 text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
            
            <button
              onClick={handleBackToEmail}
              className = "w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Back to Email Entry
            </button>
          </div>

          <div className = "text-sm text-center">
            <Link to="/login" className = "font-medium text-purple-600 hover:text-purple-500">
              Already have an account? Sign in
            </Link>
          </div>

          <div className = "mt-4 p-4 bg-blue-50 rounded-lg">
            <p className = "text-sm text-blue-800">
              <strong>Note:</strong> Check your spam folder if you don't see the email. 
              The verification link will expire in 1 hour.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Google form for additional info
  if (showGoogleForm && googleUserData) {
    return (
      <div className = "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className = "max-w-md w-full space-y-8">
          <div>
            <h2 className = "mt-6 text-center text-3xl font-extrabold text-gray-900">
              Complete Your Profile
            </h2>
            <p className = "mt-2 text-center text-sm text-gray-600">
              Welcome {googleUserData.name}! Please provide additional information.
            </p>
          </div>

          {error && (
            <div className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className = "mt-8 space-y-6" onSubmit={handleGoogleFormSubmit}>
            <div className = "rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="google-name" className = "block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="google-name"
                  name="name"
                  type="text"
                  value={googleUserData.name}
                  disabled
                  className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md bg-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="google-email" className = "block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="google-email"
                  name="email"
                  type="email"
                  value={googleUserData.email}
                  disabled
                  className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md bg-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="google-university" className = "block text-sm font-medium text-gray-700">
                  University
                </label>
                <input
                  id="google-university"
                  name="university"
                  type="text"
                  required
                  value={formData.university}
                  onChange={handleChange}
                  className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="University"
                />
              </div>

              <div>
                <label htmlFor="google-phoneNumber" className = "block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="google-phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Phone Number (e.g., +1234567890)"
                />
              </div>
            </div>

            <div className = "flex space-x-4">
              <button
                type="button"
                onClick={() => setShowGoogleForm(false)}
                className = "flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Back
              </button>
              <button
                type="submit"
                className = "flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Complete Signup
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Email input step
  if (step === 'email') {
    return (
      <div className = "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className = "max-w-md w-full space-y-8">
          <div>
            <h2 className = "mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className = "mt-2 text-center text-sm text-gray-600">
              Enter your email to get started
            </p>
          </div>

          {error && (
            <div className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <div className = "space-y-4">
            <div className = "relative">
              <div className = "absolute inset-0 flex items-center">
                <div className = "w-full border-t border-gray-300" />
              </div>
              <div className = "relative flex justify-center text-sm">
                <span className = "px-2 bg-gray-50 text-gray-700 mb-4">Sign up with</span>
              </div>
            </div>
            
            <div className = "flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>

            <div className = "relative">
              <div className = "absolute inset-0 flex items-center">
                <div className = "w-full border-t border-gray-300" />
              </div>
              <div className = "relative flex justify-center text-sm">
                <span className = "px-2 bg-gray-50 text-gray-700 mb-4 mt-4">Or continue with email</span>
              </div>
            </div>
          </div>

          <form className = "mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email-address" className = "block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className = "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending verification email...' : 'Continue'}
              </button>
            </div>

            <div className = "text-sm text-center">
              <Link to="/login" className = "font-medium text-purple-600 hover:text-purple-500">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Signup details step (after email verification)
  return (
    <div className = "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className = "max-w-md w-full space-y-8">
        <div>
          <h2 className = "mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete your signup
          </h2>
          <p className = "mt-2 text-center text-sm text-gray-600">
            Email verified ✓ {formData.email}
          </p>
        </div>

        {error && (
          <div className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className = "mt-8 space-y-6" onSubmit={handleSignupSubmit}>
          <div className = "rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className = "block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Full name"
              />
            </div>

            <div>
              <label htmlFor="email-verified" className = "block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email-verified"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md bg-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="university" className = "block text-sm font-medium text-gray-700">
                University
              </label>
              <input
                id="university"
                name="university"
                type="text"
                required
                value={formData.university}
                onChange={handleChange}
                className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="University"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className = "block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Phone Number (e.g., +1234567890)"
              />
            </div>

            <div>
              <label htmlFor="password" className = "block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Password (min. 6 characters)"
              />
            </div>
          </div>

          <div className = "flex space-x-4">
            <button
              type="button"
              onClick={handleBackToEmail}
              className = "flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Change Email
            </button>
            <button
              type="submit"
              className = "flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Sign up
            </button>
          </div>

          <div className = "text-sm text-center">
            <Link to="/login" className = "font-medium text-purple-600 hover:text-purple-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been created successfully. Click continue to proceed to your profile.
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
    </div>
  );
};

export default Signup;