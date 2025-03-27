import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/auth.js';
import Product from '../models/Product.js';

const router = express.Router();

// Configure multer for file upload
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
    const { productName, description, productType, price, sellerContact } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const product = new Product({
      productName,
      description,
      productType,
      price: parseFloat(price),
      sellerContact,
      imageUrl: `/uploads/${req.file.filename}`,
      userId: req.user._id
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

export default router;