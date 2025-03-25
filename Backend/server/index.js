import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import { verifyToken } from './middleware/auth.js';
import path, { dirname } from 'path' ; 
import { fileURLToPath } from 'url' ; 

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debugging

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Unexpected server error', 
    error: err.message 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test")
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});