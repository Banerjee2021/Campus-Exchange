import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to verify Google token
const verifyGoogleToken = async (credential) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

// Regular Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, university, phoneNumber } = req.body;

    // Comprehensive logging
    console.log('Registration attempt:', { email, name, university, phoneNumber });
    console.log('Database connection status:', mongoose.connection.readyState);
    console.log('Connected to database:', mongoose.connection.name);
    console.log('Database host:', mongoose.connection.host);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phoneNumber,
      university
    });

    // Save user
    await user.save();
    console.log('User saved successfully to database:', user._id);

    // Generate token
    let token;
    try {
      token = generateToken(user._id);
      console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
      console.log('Token generated successfully');
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ 
        message: 'Error generating authentication token', 
        error: tokenError.message 
      });
    }

    // Successful registration response
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        university: user.university
      }
    });
  } catch (error) {
    // Log the full error for server-side debugging
    console.error('Registration error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    });

    // Send a generic error response
    res.status(500).json({ 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
});

// Google Register
router.post('/google-register', async (req, res) => {
  try {
    const { name, email, googleId, picture, university, phoneNumber } = req.body;

    console.log('Google registration attempt:', { email, name, university, phoneNumber });
    console.log('Database connection status:', mongoose.connection.readyState);

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { googleId }
      ]
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email or Google account' });
    }

    // Create new user with Google data
    const user = new User({
      email,
      name,
      phoneNumber,
      university,
      googleId,
      profilePicture: picture,
      isGoogleUser: true,
      // No password for Google users
      password: undefined
    });

    // Save user
    await user.save();
    console.log('Google user saved successfully to database:', user._id);

    // Generate token
    const token = generateToken(user._id);

    // Successful registration response
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        university: user.university,
        profilePicture: user.profilePicture,
        isGoogleUser: true
      }
    });
  } catch (error) {
    console.error('Google registration error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Server error during Google registration', 
      error: error.message 
    });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const payload = await verifyGoogleToken(credential);
    const { email, name, sub: googleId, picture } = payload;

    console.log('Google login attempt for:', email);

    // Find user by email or Google ID
    const user = await User.findOne({ 
      $or: [
        { email },
        { googleId }
      ]
    });

    if (!user) {
      console.log('Google user not found:', email);
      return res.status(400).json({ 
        message: 'No account found. Please sign up first.',
        needsRegistration: true
      });
    }

    // If user exists but doesn't have Google ID, update it
    if (!user.googleId) {
      user.googleId = googleId;
      user.isGoogleUser = true;
      if (picture) user.profilePicture = picture;
      await user.save();
    }

    console.log('Google login successful for:', email);

    // Generate token
    const token = generateToken(user._id);

    // Return user info and token
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        isGoogleUser: user.isGoogleUser
      }
    });
  } catch (error) {
    console.error('Google login error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error during Google login' });
  }
});

// Regular Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);
    console.log('Database connection status:', mongoose.connection.readyState);
    console.log('Connected to database:', mongoose.connection.name);
    console.log('Database host:', mongoose.connection.host);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if it's a Google user trying to login with password
    if (user.isGoogleUser && !user.password) {
      console.log('Google user trying to login with password:', email);
      return res.status(400).json({ 
        message: 'This account was created with Google. Please use Google Sign In.' 
      });
    }

    console.log('User found, checking password...');

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password verified, generating token...');

    // Generate token
    const token = generateToken(user._id);

    console.log('Login successful for:', email);

    // Return user info and token
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        isGoogleUser: user.isGoogleUser
      }
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;