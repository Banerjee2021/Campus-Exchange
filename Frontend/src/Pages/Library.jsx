import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Plus, Eye, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Library = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [libraryItems, setLibraryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLibraryItems();
  }, []);

  const fetchLibraryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.get('http://localhost:5000/api/library/all', config);
      setLibraryItems(response.data);
    } catch (error) {
      console.error('Error fetching library items:', error);
    }
  };

  const handleView = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/library/view/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Unable to view file. Please ensure you are logged in.');
    }
  };

  const handleDownload = async (itemId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/library/download/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const file = new Blob([response.data], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Unable to download file. Please ensure you are logged in.');
    }
  };

  const filteredItems = libraryItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Free Library</h1>
      
      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" />
          </div>
        </div>
        {user && (
          <button
            onClick={() => navigate('/post-library-item')}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">No files uploaded yet.</p>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item._id} 
              className="border border-gray-200 rounded-lg p-4 shadow-md flex flex-col"
            >
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Uploaded by: {item.userName}</p>
                  <p>Year: {item.year}</p>
                  <p>Semester: {item.semester}</p>
                  <p>Uploaded on: {formatDate(item.createdAt)}</p>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button 
                  onClick={() => handleView(item._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Eye size={16} />
                  View
                </button>
                <button 
                  onClick={() => handleDownload(item._id, item.files[0])}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;