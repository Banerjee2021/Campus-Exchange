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

// Connect to MongoDB campus-exchange cluster and database
console.log('Connecting to MongoDB...');

// Extract base URI and add database name properly
let mongoURI;
if (process.env.MONGODB_URI) {
  // Insert database name before the query parameters
  const baseURI = process.env.MONGODB_URI;
  // Check if URI already has a database name or ends with /
  if (baseURI.includes('?')) {
    // Insert database name before query parameters
    mongoURI = baseURI.replace('/?', '/campus-exchange?');
  } else {
    // Add database name at the end
    mongoURI = baseURI + '/campus-exchange';
  }
} else {
  mongoURI = 'mongodb://localhost:27017/campus-exchange';
}

console.log('Connecting to campus-exchange cluster and database...');
console.log('MongoDB URI:', mongoURI);

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Cluster: campus-exchange');
    console.log('Database: campus-exchange');
    console.log('Ready to fetch data from all collections');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Use httpServer instead of app.listen
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Target cluster: data`);
  console.log(`Target database: campus-exchange`);
});