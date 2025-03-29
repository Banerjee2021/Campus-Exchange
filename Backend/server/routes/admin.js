import express from 'express';
import Admin from '../models/Admin.js';
import { verifyToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Create admin account (protected route that requires authentication)
router.post('/create', verifyToken, async (req, res) => {
  try {
    // Check if the request is from an existing admin
    if (!req.user || !req.user._id || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const { name, email, password } = req.body;
    
    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }
    
    // Create new admin
    const admin = new Admin({
      name,
      email,
      password
    });
    
    // Save admin to database
    await admin.save();
    
    // Return success (without returning password)
    res.status(201).json({
      message: 'Admin account created successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ 
      message: 'Server error during admin creation', 
      error: error.message 
    });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(admin._id);
    
    // Send response
    res.json({
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Get all admins (protected admin-only route)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Check if the request is from an admin
    if (!req.user || !req.user._id || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    // Fetch all admins without returning passwords
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    console.error('Fetch admins error:', error);
    res.status(500).json({ message: 'Server error while fetching admins' });
  }
});

export default router;