
import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/auth.js';
import Product from '../models/Product.js';
import User from '../models/User.js';  
import Admin from '../models/Admin.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
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

    const product = new Product({
      productName,
      description,
      productType,
      price: parseFloat(price),
      sellerContact,
      sellerName,
      sellerEmail,
      imageUrl: `/uploads/${req.file.filename}`,
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

// Also add a route to delete a specific product
router.delete('/:productId', verifyToken, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ 
      _id: req.params.productId, 
      userId: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or you do not have permission to delete' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

export default router;