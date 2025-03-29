import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const generateToken = (userId) => {
  // Ensure JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

export const verifyToken = async (req, res, next) => {
  // Ensure JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // First try to find a regular user
    let user = await User.findById(decoded.id).select('-password');
    let isAdmin = false;
    
    // If not a regular user, check if it's an admin
    if (!user) {
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // It's an admin
      user = admin;
      isAdmin = true;
    }

    // Attach user details to the request
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: isAdmin
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const optionalVerifyToken = async (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token, continue without user context
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user first
    let user = await User.findById(decoded.id).select('-password');
    let isAdmin = false;
    
    // If not found, try to find admin
    if (!user) {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) {
        user = admin;
        isAdmin = true;
      }
    }

    if (!user) {
      return next();
    }

    // Attach user to request object
    req.user = {
      ...user._doc,
      isAdmin
    };
    next();
  } catch (error) {
    // If token is invalid, continue without user context
    next();
  }
};