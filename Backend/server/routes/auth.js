import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register
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
        university: user.university
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