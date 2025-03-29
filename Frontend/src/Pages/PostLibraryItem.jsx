import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '../components/ui/alert-dialog';

const PostLibraryItem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('First(1st)');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  React.useEffect(() => {
    if (!checkAuth()) {
      navigate('/login');
    }
  }, [checkAuth, navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type for ${file.name}. Only PDF, DOC, and DOCX are allowed.`);
        return false;
      }

      if (file.size > maxSize) {
        setError(`${file.name} exceeds 50MB limit.`);
        return false;
      }

      return true;
    });

    setFiles(validFiles);
    setError(''); // Clear previous errors
  };

  const handleRemoveFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!title || !year || !semester) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate files
    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    // Create form data for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('year', year);
    formData.append('semester', semester);
    
    // Append files
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      // Get token from local storage
      const token = localStorage.getItem('token');

      // Send request
      const response = await axios.post('http://localhost:5000/api/library/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Success handling
      setSuccess('Library item posted successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setYear('');
      setSemester('First(1st)');
      setFiles([]);
    } catch (err) {
      // Detailed error handling
      console.error('Library Item Post Error:', err);
      
      // Check for specific error types
      if (err.response) {
        // The request was made and the server responded with a status code
        setError(err.response.data.message || 'Failed to post library item');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setError('Error preparing the request. Please try again.');
      }
    }
  };

  const handleContinue = () => {
    navigate('/library');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Post Library Item</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          {success}
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Notes Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-1 px-1"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-1 py-1"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-1 px-1"
              required
            />
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-1 py-1"
              required
            >
              <option className = "cursor-pointer">First(1st)</option>
              <option className = "cursor-pointer">Second(2nd)</option>
              <option className = "cursor-pointer">Third(3rd)</option>
              <option className = "cursor-pointer">Fourth(4th)</option>
              <option className = "cursor-pointer">Fifth(5th)</option>
              <option className = "cursor-pointer">Sixth(6th)</option>
              <option className = "cursor-pointer">Seventh(7th)</option>
              <option className = "cursor-pointer">Eighth(8th)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Files
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                  >
                    <span>Upload files</span>
                    <input 
                      id="file-upload" 
                      name="files" 
                      type="file" 
                      className="sr-only" 
                      multiple 
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX up to 50MB 
                  {files.length > 0 && ` - ${files.length} file(s) selected`}
                </p>
              </div>
            </div>

            {/* File details display */}
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Selected Files:</h3>
                <ul className="divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <li key={index} className="py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-4">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file)}
                        className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
            >
              Post to Library
            </button>
          </div>
        </form>
      </div>

      <AlertDialog open={success}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Library Item Posted Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your library item has been uploaded and is now available in the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleContinue}  className="mt-2 sm:mt-0 inline-flex h-10 items-center justify-center rounded-md bg-[dodgerblue] px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
              Continue to Library
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostLibraryItem;