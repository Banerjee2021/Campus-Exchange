import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const Signup = () => {
  const [formData, setFormData] = useState({
    university: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const { googleRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(
        atob(credentialResponse.credential.split(".")[1])
      );

      setGoogleUserData({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture,
      });

      setShowGoogleForm(true);
    } catch (error) {
      console.error("Error decoding Google credential:", error);
      setError("Failed to process Google authentication");
    }
  };

  const handleGoogleError = () => {
    setError("Google authentication failed. Please try again.");
  };

  const handleGoogleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.university || !formData.phoneNumber) {
      setError("University and phone number are required");
      return;
    }

    // Phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    const googleRegistrationData = {
      ...googleUserData,
      university: formData.university,
      phoneNumber: formData.phoneNumber,
    };

    const result = await googleRegister(googleRegistrationData);
    if (result.success) {
      // Redirect immediately to home page after successful signup
      navigate("/");
    } else {
      setError(result.message);
    }
  };

  // Main signup page with Google OAuth only
  if (!showGoogleForm) {
    return (
      <div className = "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className = "max-w-md w-full space-y-8">
          <div>
            <h2 className = "mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className = "mt-2 text-center text-sm text-gray-600">
              Sign up with your Google account to get started
            </p>
          </div>

          {error && (
            <div className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className = "space-y-6">
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
          </div>

          <div className = "text-sm text-center">
            <Link
              to="/login"
              className = "font-medium text-purple-600 hover:text-purple-500"
            >
              Already have an account? Sign in
            </Link>
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
              Welcome {googleUserData.name}! Please provide additional
              information.
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
                <label
                  htmlFor="google-name"
                  className = "block text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="google-email"
                  className = "block text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="google-university"
                  className = "block text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="google-phoneNumber"
                  className = "block text-sm font-medium text-gray-700"
                >
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

  return null;
};

export default Signup;