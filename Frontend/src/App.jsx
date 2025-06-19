import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import AdminManagement from "./components/AdminManagement.jsx";
import Messages from "./Pages/Messages.jsx";
import Inbox from "./Pages/Inbox.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

// Import all components directly instead of lazy loading to avoid build issues
import Home from "./Pages/Home.jsx";
import Marketplace from "./Pages/Marketplace.jsx";
import Library from "./Pages/Library.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Profile from "./Pages/Profile.jsx";
import PostItem from "./Pages/PostItem.jsx";
import PostLibraryItem from "./Pages/PostLibraryItem.jsx";

// Component to handle loading state during navigation
const LoadingWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second loading

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className = "min-h-screen flex flex-col">
        <Navbar />
        <main className = "flex-grow pt-16">
          <LoadingWrapper>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Home />} />

                <Route
                  path="/marketplace"
                  element={
                    <ProtectedRoute>
                      <Marketplace />
                    </ProtectedRoute>
                  }
                />
                <Route path="/library" element={<Library />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inbox"
                  element={
                    <ProtectedRoute>
                      <Inbox />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/post-item" element={<PostItem />} />
                <Route path="/post-library-item" element={<PostLibraryItem />} />
                <Route
                  path="/admin/manage"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminManagement />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </LoadingWrapper>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;