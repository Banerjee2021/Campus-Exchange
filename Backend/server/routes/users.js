import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js'
import Admin from '../models/Admin.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Check if we're dealing with admin or regular user based on the flag set in verifyToken middleware
    if (req.user.isAdmin) {
      // Fetch admin profile
      const admin = await Admin.findById(req.user._id).select('-password');
      
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      // Return admin data with isAdmin flag
      return res.json({
        ...admin._doc,
        isAdmin: true
      });
    } else {
      // Fetch regular user profile
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Delete user account
router.delete('/delete', verifyToken, async (req, res) => {
  try {
    // The user ID is available from the verifyToken middleware
    const userId = req.user._id;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the deletion for debugging
    console.log('User account deleted:', {
      userId: deletedUser._id,
      email: deletedUser.email
    });

    // Send successful deletion response
    res.status(200).json({ 
      message: 'Account deleted successfully',
      deletedUser: {
        _id: deletedUser._id,
        email: deletedUser.email
      }
    });
  } catch (error) {
    // Comprehensive error logging
    console.error('Account Deletion Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Send error response
    res.status(500).json({ 
      message: 'Error deleting account', 
      error: error.message 
    });
  }
});

export default router;