import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http'; // Import for HTTP server
import { Server } from 'socket.io'; // Import Socket.io
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import libraryRoutes from './routes/library.js';
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();

// Create HTTP server using Express app
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify your frontend domain
    methods: ["GET", "POST"]
  }
});

// Active users (email -> socket ID)
const activeUsers = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // User joins their room (based on email)
  socket.on('join', (userEmail) => {
    console.log(`User ${userEmail} joined their room`);
    activeUsers.set(userEmail, socket.id);
    socket.join(userEmail);
  });
  
  // Sending messages
  socket.on('sendMessage', ({ to, message }) => {
    console.log(`Message to ${to}:`, message);
    
    // Emit to recipient's room
    io.to(to).emit('receiveMessage', message);
  });
  
  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from active users
    for (const [email, sid] of activeUsers.entries()) {
      if (sid === socket.id) {
        activeUsers.delete(email);
        break;
      }
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/library', libraryRoutes);  
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Create uploads directory if it doesn't exist
import { mkdir } from 'fs/promises';
try {
  await mkdir(path.join(__dirname, '../uploads/library'), { recursive: true });
  await mkdir(path.join(__dirname, '../uploads/marketplace'), { recursive: true });
} catch (err) {
  console.error('Error creating uploads directory:', err);
}

// Use httpServer instead of app.listen
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});