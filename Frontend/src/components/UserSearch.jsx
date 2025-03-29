import React, { useState, useEffect } from "react";
import { Search, User, X } from "lucide-react";
import axios from "axios";

const UserSearch = ({ onUserSelected, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delaySearch = setTimeout(() => {
        searchUsers();
      }, 500);
      
      return () => clearTimeout(delaySearch);
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/users/search?query=${searchTerm}`);
      setUsers(response.data);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Find Users</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search
          className="absolute left-3 top-2.5 text-gray-400"
          size={18}
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {users.length === 0 && searchTerm.length >= 2 ? (
              <p className="text-gray-500 text-center py-4">No users found</p>
            ) : (
              <ul>
                {users.map(user => (
                  <li 
                    key={user._id}
                    className="p-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center"
                    onClick={() => onUserSelected(user)}
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-full text-white mr-3">
                      <User size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.university && (
                        <p className="text-xs text-gray-400">{user.university}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserSearch;