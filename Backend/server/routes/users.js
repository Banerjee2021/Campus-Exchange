import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js'; // Add Product import
import LibraryItem from '../models/LibraryItem.js'; // Add LibraryItem import
import { verifyToken } from '../middleware/auth.js'
import Admin from '../models/Admin.js';
import { del } from '@vercel/blob'; // Add del import for blob deletion

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

router.get('/search', verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    // Search for users by name or email
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude the current user
    })
    .select('name email university phoneNumber')
    .limit(10);
    
    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

// Helper function to delete files from Vercel Blob
const deleteFilesFromBlob = async (files) => {
  const deletionPromises = files.map(async (fileInfo) => {
    try {
      if (fileInfo.url && fileInfo.url.includes('vercel-storage.com')) {
        await del(fileInfo.url);
        console.log('File deleted from Vercel Blob:', fileInfo.url);
      }
    } catch (error) {
      console.error('Error deleting file from Vercel Blob:', error);
    }
  });
  
  await Promise.allSettled(deletionPromises);
};

// Delete user account and all associated content from Vercel Blob
router.delete('/delete', verifyToken, async (req, res) => {
  try {
    // The user ID is available from the verifyToken middleware
    const userId = req.user._id;

    // Get all products associated with this user to delete their images
    const userProducts = await Product.find({ userId });
    
    // Delete product images from Vercel Blob
    if (userProducts.length > 0) {
      const productImageDeletions = userProducts.map(async (product) => {
        try {
          if (product.imageUrl && product.imageUrl.includes('vercel-storage.com')) {
            await del(product.imageUrl);
            console.log('Product image deleted from Vercel Blob:', product.imageUrl);
          }
        } catch (error) {
          console.error('Error deleting product image from Vercel Blob:', error);
        }
      });
      
      await Promise.allSettled(productImageDeletions);
    }
    
    // Get all library items associated with this user to delete their files
    const userLibraryItems = await LibraryItem.find({ user: userId });
    
    // Delete library files from Vercel Blob
    if (userLibraryItems.length > 0) {
      for (const libraryItem of userLibraryItems) {
        if (libraryItem.files && libraryItem.files.length > 0) {
          await deleteFilesFromBlob(libraryItem.files);
        }
      }
    }
    
    // Delete all products associated with this user from database
    await Product.deleteMany({ userId });
    
    // Delete all library items associated with this user from database
    await LibraryItem.deleteMany({ user: userId });

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the deletion for debugging
    console.log('User account and all associated content deleted:', {
      userId: deletedUser._id,
      email: deletedUser.email,
      productsDeleted: userProducts.length,
      libraryItemsDeleted: userLibraryItems.length
    });

    // Send successful deletion response
    res.status(200).json({ 
      message: 'Account and all associated content deleted successfully',
      deletedUser: {
        _id: deletedUser._id,
        email: deletedUser.email
      },
      deletedCounts: {
        products: userProducts.length,
        libraryItems: userLibraryItems.length
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
      message: 'Error deleting account and associated content', 
      error: error.message 
    });
  }
});

export default router;