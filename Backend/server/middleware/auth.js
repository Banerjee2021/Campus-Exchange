import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const generateToken = (userId) => {
  // Ensure JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing from environment variables');
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  console.log('Generating token for user:', userId);
  
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

export const verifyToken = async (req, res, next) => {
  // Ensure JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing from environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    console.log('Verifying token...');
    console.log('Database connection status:', mongoose.connection.readyState);
    console.log('Connected to database:', mongoose.connection.name);
    console.log('Database host:', mongoose.connection.host);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded, user ID:', decoded.id);
    
    // First try to find a regular user
    let user = await User.findById(decoded.id).select('-password');
    let isAdmin = false;
    
    console.log('Regular user found:', !!user);
    
    // If not a regular user, check if it's an admin
    if (!user) {
      console.log('Checking admin...');
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        console.log('Neither user nor admin found for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      
      // It's an admin
      user = admin;
      isAdmin = true;
      console.log('Admin found:', admin.email);
    }

    // Attach user details to the request
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: isAdmin
    };

    console.log('Token verification successful for:', user.email);
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const optionalVerifyToken = async (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token, continue without user context
  if (!token) {
    console.log('No token provided, continuing without authentication');
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Optional token verification for user ID:', decoded.id);

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
      console.log('User not found for optional verification, continuing without auth');
      return next();
    }

    // Attach user to request object
    req.user = {
      ...user._doc,
      isAdmin
    };
    
    console.log('Optional authentication successful for:', user.email);
    next();
  } catch (error) {
    // If token is invalid, continue without user context
    console.log('Optional token verification failed, continuing without auth:', error.message);
    next();
  }
};