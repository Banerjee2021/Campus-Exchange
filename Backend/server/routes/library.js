import express from 'express';
import LibraryItem from '../models/LibraryItem.js';
import { verifyToken, optionalVerifyToken } from '../middleware/auth.js';
import multer from 'multer';
import { put, del } from '@vercel/blob';

const router = express.Router();

// Configure multer for memory storage (since we're uploading to Vercel Blob)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/i;
    const extname = filetypes.test(file.originalname.split('.').pop());
    const mimetype = file.mimetype.includes('pdf') || 
                     file.mimetype.includes('msword') || 
                     file.mimetype.includes('document');

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
  console.log('Request Files:', req.files?.map(f => ({ name: f.originalname, size: f.size })));
  console.log('User:', req.user?.email);
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
          
          return res.status(400).json({ 
            message: 'Missing required fields',
            details: {
              title: !!title,
              year: !!year,
              semester: !!semester
            }
          });
        }

        // Upload files to Vercel Blob
        const fileUrls = [];
        
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            try {
              // Create a unique filename
              const timestamp = Date.now();
              const filename = `${timestamp}-${file.originalname}`;
              const blobPath = `library/${filename}`;
              
              // Upload to Vercel Blob
              const blob = await put(blobPath, file.buffer, {
                access: 'public',
                addRandomSuffix: false
              });
              
              fileUrls.push({
                url: blob.url,
                filename: file.originalname,
                size: file.size,
                mimetype: file.mimetype
              });
              
              console.log('File uploaded to Vercel Blob:', blob.url);
            } catch (blobError) {
              console.error('Error uploading file to Vercel Blob:', blobError);
              throw new Error(`Failed to upload file: ${file.originalname}`);
            }
          }
        }

        // Create library item
        const libraryItem = new LibraryItem({
          title,
          description: description || '',
          year: parseInt(year),
          semester,
          files: fileUrls, // Store array of file objects with URLs
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

        // If there was an error after some files were uploaded, clean them up
        // Note: Vercel Blob cleanup would need to be implemented separately
        // You might want to store the uploaded URLs and clean them up in case of error

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

// Get all library items
router.get('/all', optionalVerifyToken, async (req, res) => {
  try {
    // Fetch all library items, sort by most recent first
    const libraryItems = await LibraryItem.find()
      .sort({ createdAt: -1 })
      .select('title description year semester userName userEmail files createdAt');

    res.json(libraryItems);
  } catch (error) {
    console.error('Error fetching library items:', error);
    res.status(500).json({ 
      message: 'Error fetching library items', 
      error: error.message 
    });
  }
});

// View file (redirect to Vercel Blob URL)
router.get('/view/:id', optionalVerifyToken, async (req, res) => {
  try {
    // Find the library item
    const libraryItem = await LibraryItem.findById(req.params.id);

    if (!libraryItem) {
      return res.status(404).json({ message: 'File not found' });
    }

    // For view, we'll return the file URL so frontend can handle it
    if (libraryItem.files && libraryItem.files.length > 0) {
      const fileInfo = libraryItem.files[0];
      res.json({ 
        url: fileInfo.url,
        filename: fileInfo.filename,
        mimetype: fileInfo.mimetype || 'application/octet-stream'
      });
    } else {
      res.status(404).json({ message: 'No files found for this item' });
    }
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ message: 'Error viewing file', error: error.message });
  }
});

// Download file (redirect to Vercel Blob URL)
router.get('/download/:id', optionalVerifyToken, async (req, res) => {
  try {
    // Find the library item
    const libraryItem = await LibraryItem.findById(req.params.id);

    if (!libraryItem) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Return the file URL for download
    if (libraryItem.files && libraryItem.files.length > 0) {
      const fileInfo = libraryItem.files[0];
      res.json({ 
        url: fileInfo.url,
        filename: fileInfo.filename,
        mimetype: fileInfo.mimetype || 'application/octet-stream'
      });
    } else {
      res.status(404).json({ message: 'No files found for this item' });
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});

// Delete library item and associated files
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const libraryItem = await LibraryItem.findById(req.params.id);

    // Check if library item exists
    if (!libraryItem) {
      return res.status(404).json({ message: 'Library item not found' });
    }

    // Ensure only the owner can delete the item (or admin)
    if (libraryItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Delete associated files from Vercel Blob
    if (libraryItem.files && libraryItem.files.length > 0) {
      for (const fileInfo of libraryItem.files) {
        try {
          // Extract the blob path from URL
          const url = new URL(fileInfo.url);
          const blobPath = url.pathname.substring(1); // Remove leading slash
          
          await del(fileInfo.url);
          console.log('File deleted from Vercel Blob:', blobPath);
        } catch (fileDeleteError) {
          console.error('Error deleting file from Vercel Blob:', fileDeleteError);
          // Continue with database deletion even if blob deletion fails
        }
      }
    }

    // Remove the library item from the database
    await LibraryItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Library item deleted successfully' });
  } catch (error) {
    console.error('Error deleting library item:', error);
    res.status(500).json({ 
      message: 'Error deleting library item', 
      error: error.message 
    });
  }
});

export default router;