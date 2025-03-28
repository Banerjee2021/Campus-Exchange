import express from 'express';
import LibraryItem from '../models/LibraryItem.js';
import { verifyToken, optionalVerifyToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/library');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed!'), false);
    }
  }
});

// Middleware to log request details
const logRequest = (req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Request Files:', req.files);
  console.log('User:', req.user);
  next();
};

// Create a new library item
router.post('/create', 
  verifyToken,  // Verify authentication first
  logRequest,   // Log request details for debugging
  (req, res, next) => {
    // Use upload.array with error handling
    upload.array('files', 5)(req, res, async (uploadError) => {
      // Log any upload errors
      if (uploadError) {
        console.error('Multer Upload Error:', uploadError);
        return res.status(400).json({ 
          message: uploadError.message || 'File upload error',
          error: uploadError
        });
      }

      try {
        const { title, description, year, semester } = req.body;

        // Validate required fields with more detailed logging
        console.log('Received Fields:', { title, description, year, semester });

        if (!title || !year || !semester) {
          console.error('Missing Required Fields', { title, year, semester });
          
          // Clean up uploaded files if validation fails
          if (req.files) {
            req.files.forEach(file => {
              try {
                fs.unlinkSync(file.path);
              } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
              }
            });
          }

          return res.status(400).json({ 
            message: 'Missing required fields',
            details: {
              title: !!title,
              year: !!year,
              semester: !!semester
            }
          });
        }

        // Process uploaded files
        const filePaths = req.files ? req.files.map(file => file.path) : [];

        // Create library item
        const libraryItem = new LibraryItem({
          title,
          description: description || '',
          year: parseInt(year),
          semester,
          files: filePaths,
          user: req.user._id,
          userName: req.user.name,
          userEmail: req.user.email
        });

        // Save to database
        await libraryItem.save();

        res.status(201).json({
          message: 'Library item created successfully',
          libraryItem: {
            _id: libraryItem._id,
            title: libraryItem.title,
            description: libraryItem.description,
            year: libraryItem.year,
            semester: libraryItem.semester,
            files: libraryItem.files
          }
        });
      } catch (error) {
        // Comprehensive error logging
        console.error('Library Item Creation Error:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          details: error
        });

        // Clean up uploaded files if an error occurs
        if (req.files) {
          req.files.forEach(file => {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkError) {
              console.error('Error deleting file:', unlinkError);
            }
          });
        }

        // Send detailed error response
        res.status(500).json({ 
          message: 'Error creating library item', 
          error: error.message,
          details: error.name === 'ValidationError' 
            ? Object.values(error.errors).map(err => err.message)
            : null
        });
      }
    });
  }
);

router.get('/all', optionalVerifyToken, async (req, res) => {
  try {
    // Fetch all library items, sort by most recent first
    const libraryItems = await LibraryItem.find()
      .sort({ createdAt: -1 })
      .select('title description year semester userName userEmail files');

    res.json(libraryItems);
  } catch (error) {
    console.error('Error fetching library items:', error);
    res.status(500).json({ 
      message: 'Error fetching library items', 
      error: error.message 
    });
  }
});

// Modify view and download routes to use optional token verification
router.get('/view/:id', optionalVerifyToken, async (req, res) => {
  try {
    // Find the library item (no user check)
    const libraryItem = await LibraryItem.findById(req.params.id);

    if (!libraryItem) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if the request includes a token and user
    if (req.user) {
      // If user is logged in, you can add additional checks if needed
      if (libraryItem.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this file' });
      }
    }

    // Assuming first file, you might want to handle multiple files
    const filePath = libraryItem.files[0];

    // Send the file
    res.download(filePath, path.basename(filePath), (err) => {
      if (err) {
        res.status(500).json({ message: 'Error viewing file', error: err.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error viewing file', error: error.message });
  }
});

router.get('/download/:id', optionalVerifyToken, async (req, res) => {
  try {
    // Find the library item (no user check)
    const libraryItem = await LibraryItem.findById(req.params.id);

    if (!libraryItem) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if the request includes a token and user
    if (req.user) {
      // If user is logged in, you can add additional checks if needed
      if (libraryItem.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to download this file' });
      }
    }

    // Assuming first file, you might want to handle multiple files
    const filePath = libraryItem.files[0];

    // Send the file for download
    res.download(filePath, path.basename(filePath), (err) => {
      if (err) {
        res.status(500).json({ message: 'Error downloading file', error: err.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});


export default router;