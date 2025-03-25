import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const generateToken = (userId) => {
  // Ensure JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

export const verifyToken = (req, res, next) => {
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
    req.user = { _id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};