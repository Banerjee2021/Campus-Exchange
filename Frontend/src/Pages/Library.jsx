import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Plus, Eye, Download, Trash2, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const Library = () => {
  const navigate = useNavigate();
  const { user, checkAuth, isAdmin } = useAuth();
  const [libraryItems, setLibraryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchLibraryItems();
  }, []);

  const fetchLibraryItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.get(
        "http://localhost:5000/api/library/all",
        config
      );
      setLibraryItems(response.data);
    } catch (error) {
      console.error("Error fetching library items:", error);
    }
  };

  const handleView = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.get(
        `http://localhost:5000/api/library/view/${itemId}`,
        config
      );

      const { url, filename, mimetype } = response.data;
      const fileExtension = filename.split(".").pop().toLowerCase();

      // For PDF files, open in new tab for viewing
      if (fileExtension === "pdf" || mimetype === "application/pdf") {
        window.open(url, "_blank");
      }
      // For DOC/DOCX files, show message and offer download
      else if (["doc", "docx"].includes(fileExtension)) {
        const userChoice = window.confirm(
          `${fileExtension.toUpperCase()} files cannot be previewed directly in the browser. Would you like to download the file to view it?`
        );
        if (userChoice) {
          handleDownload(itemId, filename);
        }
      } else {
        // For other file types, recommend downloading
        const userChoice = window.confirm(
          `File type .${fileExtension} cannot be previewed directly. Would you like to download the file to view it?`
        );
        if (userChoice) {
          handleDownload(itemId, filename);
        }
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      alert("Unable to view file. Please try again.");
    }
  };

  const handleDownload = async (itemId, filename) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.get(
        `http://localhost:5000/api/library/download/${itemId}`,
        config
      );

      const { url } = response.data;
      
      // Create a temporary link element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Unable to download file. Please try again.");
    }
  };

  const openDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/library/${itemToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove item from the state
      setLibraryItems(
        libraryItems.filter((item) => item._id !== itemToDelete._id)
      );
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Unable to delete file. Please try again.");
      closeDeleteDialog();
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("Date parsing error:", e, dateString);
      return "N/A";
    }
  };

  const getFileExtension = (item) => {
    if (item.files && item.files.length > 0) {
      const filename = item.files[0].filename || item.files[0].url;
      return filename.split(".").pop().toUpperCase();
    }
    return "N/A";
  };

  const getFileName = (item) => {
    if (item.files && item.files.length > 0) {
      return item.files[0].filename || "Unknown";
    }
    return "No file";
  };

  const filteredItems = libraryItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            onClick={() => navigate("/post-library-item")}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">
            No files uploaded yet.
          </p>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                opacity: 0,
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`,
              }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Uploaded by: {item.userName}</p>
                    <p>Year: {item.year}</p>
                    <p>Semester: {item.semester}</p>
                    <p>Uploaded on: {formatDate(item.createdAt)}</p>
                    <p className="flex items-center">
                      <FileText size={14} className="mr-1" />
                      File type: {getFileExtension(item)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleView(item._id)}
                    className="flex-1 mr-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(item._id, getFileName(item))}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>

                {/* Admin Delete Button */}
                {isAdmin && (
                  <div className="mt-2">
                    <button
                      onClick={() => openDeleteDialog(item)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete the file?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible and will delete the file permanently
              from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Library;