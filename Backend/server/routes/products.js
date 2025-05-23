import express from 'express';
import multer from 'multer';
import { put, del } from '@vercel/blob'; // Add del import
import { verifyToken } from '../middleware/auth.js';
import Product from '../models/Product.js';
import User from '../models/User.js';  
import Admin from '../models/Admin.js';

const router = express.Router();

// Configure multer to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create a new product
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { productName, description, productType, price } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    let sellerContact = '';
    let sellerName = '';
    let sellerEmail = '';

    // Check if the request is from an admin or a regular user
    if (req.user.isAdmin) {
      // For admin users
      const admin = await Admin.findById(req.user._id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      sellerName = admin.name;
      sellerEmail = admin.email;
      sellerContact = 'Admin'; // Or any default value for admin contact
    } else {
      // For regular users
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      sellerName = user.name;
      sellerEmail = user.email;
      sellerContact = user.phoneNumber || '';
    }

    // Upload image to Vercel Blob
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split('.').pop();
    const filename = `marketplace/${timestamp}-${productName.replace(/[^a-zA-Z0-9]/g, '-')}.${fileExtension}`;
    
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
    });

    console.log('Image uploaded to Vercel Blob:', blob.url);

    const product = new Product({
      productName,
      description,
      productType,
      price: parseFloat(price),
      sellerContact,
      sellerName,
      sellerEmail,
      imageUrl: blob.url, // Store the Vercel Blob URL
      userId: req.user._id,
      postedByAdmin: req.user.isAdmin || false
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

router.get('/user', verifyToken, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user products', error: error.message });
  }
});

// Modified route to delete a specific product - allowing admins to delete any product
// AND delete associated image from Vercel Blob
router.delete('/:productId', verifyToken, async (req, res) => {
  try {
    let product;
    
    // Check if the user is an admin
    if (req.user.isAdmin) {
      // If admin, allow deletion of any product
      product = await Product.findById(req.params.productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
    } else {
      // If regular user, only allow deletion of their own products
      product = await Product.findOne({ 
        _id: req.params.productId, 
        userId: req.user._id 
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found or you do not have permission to delete' });
      }
    }

    // Delete the image from Vercel Blob if it exists
    if (product.imageUrl && product.imageUrl.includes('vercel-storage.com')) {
      try {
        await del(product.imageUrl);
        console.log('Image deleted from Vercel Blob:', product.imageUrl);
      } catch (blobDeleteError) {
        console.error('Error deleting image from Vercel Blob:', blobDeleteError);
        // Continue with database deletion even if blob deletion fails
      }
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(req.params.productId);

    res.json({ message: 'Product and associated image deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

export default router;