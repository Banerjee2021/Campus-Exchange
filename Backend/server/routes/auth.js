import express from 'express';
import User from '../models/User.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, university } = req.body;

    // Comprehensive logging
    console.log('Registration attempt:', { email, name, university, password });

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
      university
    });

    // Save user
    await user.save();

    // Generate token
    let token;
    try {
      token = generateToken(user._id);
      console.log('JWT_SECRET:', process.env.JWT_SECRET);
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
        university: user.university
      }
    });
  } catch (error) {
    // Log the full error for server-side debugging
    console.error('Registration error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
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

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;