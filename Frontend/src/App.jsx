import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import AdminManagement from "./components/AdminManagement.jsx";
import Messages from "./Pages/Messages.jsx";
import Inbox from './Pages/Inbox.jsx';

// Lazy load pages
const Home = React.lazy(() => import("./Pages/Home.jsx"));
const Marketplace = React.lazy(() => import("./pages/Marketplace.jsx"));
const Library = React.lazy(() => import("./pages/Library.jsx"));
const Login = React.lazy(() => import("./pages/Login.jsx"));
const Signup = React.lazy(() => import("./pages/Signup.jsx"));
const Profile = React.lazy(() => import("./pages/Profile.jsx"));
const PostItem = React.lazy(() => import("./pages/PostItem.jsx"));
const PostLibraryItem = React.lazy(() => import("./pages/PostLibraryItem.jsx"));
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className = "min-h-screen flex flex-col">
        <Navbar />
        <main className = "flex-grow pt-16">
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
              <Route path="/messages" element={<Messages />} />
              <Route path="/inbox" element={<Inbox />} />

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
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
