import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from './models/Admin.js';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Admin details
const adminData = {
  name: 'Pratyush Nayak',
  email: 'pratyushn567@gmail.com',
  password: 'pratik0912'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        console.log('Admin already exists with this email.');
      } else {
        // Create new admin
        const admin = new Admin(adminData);
        await admin.save();
        console.log('Admin account created successfully:', {
          name: admin.name,
          email: admin.email,
          id: admin._id
        });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    } finally {
      // Close the connection
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });