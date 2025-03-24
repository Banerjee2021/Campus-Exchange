import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

const Library = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Free Library</h1>
      
      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => navigate('/post-library-item')}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <p className="text-gray-500 text-center col-span-full">No files uploaded yet.</p>
      </div>
    </div>
  );
};

export default Library;