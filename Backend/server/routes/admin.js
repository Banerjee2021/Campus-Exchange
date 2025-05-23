import express from 'express';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import LibraryItem from '../models/LibraryItem.js'; // Add LibraryItem import
import { verifyToken, generateToken } from '../middleware/auth.js';
import { del } from '@vercel/blob'; // Add del import for blob deletion

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

// Get all regular users (protected admin-only route)
router.get('/users', verifyToken, async (req, res) => {
  try {
    // Check if the request is from an admin
    if (!req.user || !req.user._id || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    // Fetch all users without returning passwords
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
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

// Delete a user and their marketplace items and library items (protected admin-only route)
router.delete('/users/:userId', verifyToken, async (req, res) => {
  try {
    // Check if the request is from an admin
    if (!req.user || !req.user._id || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    const { userId } = req.params;
    
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
    
    // Delete all products associated with this user
    await Product.deleteMany({ userId });
    
    // Delete all library items associated with this user
    await LibraryItem.deleteMany({ user: userId });
    
    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'User and all associated content (products, library items, and files) deleted successfully',
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
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// Delete an admin (protected admin-only route)
router.delete('/:adminId', verifyToken, async (req, res) => {
  try {
    // Check if the request is from an admin
    if (!req.user || !req.user._id || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    const { adminId } = req.params;
    
    // Prevent deleting yourself
    if (adminId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }
    
    // Get all products posted by this admin to delete their images
    const adminProducts = await Product.find({ userId: adminId, postedByAdmin: true });
    
    // Delete admin product images from Vercel Blob
    if (adminProducts.length > 0) {
      const productImageDeletions = adminProducts.map(async (product) => {
        try {
          if (product.imageUrl && product.imageUrl.includes('vercel-storage.com')) {
            await del(product.imageUrl);
            console.log('Admin product image deleted from Vercel Blob:', product.imageUrl);
          }
        } catch (error) {
          console.error('Error deleting admin product image from Vercel Blob:', error);
        }
      });
      
      await Promise.allSettled(productImageDeletions);
    }
    
    // Delete all products posted by this admin
    await Product.deleteMany({ userId: adminId, postedByAdmin: true });
    
    // Delete the admin
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);
    
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ 
      message: 'Admin and associated products deleted successfully',
      deletedAdmin: {
        _id: deletedAdmin._id,
        email: deletedAdmin.email
      },
      deletedProductsCount: adminProducts.length
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error while deleting admin' });
  }
});

export default router;