import React from "react";
import { Routes, Route } from "react-router-dom";

// --- Components ---
import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";

// --- Pages ---
import Home from "./Pages/Home.jsx";
import Events from "./Pages/Events.jsx";
import Blog from "./Pages/Blog.jsx";
import BlogPost from "./Pages/BlogPost.jsx";
import Membership from "./Pages/Membership.jsx";
import Partnerships from "./Pages/Partnership.jsx";
import About from "./Pages/About.jsx";
import Contact from "./Pages/Contact.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";
import SuccessPage from "./Pages/SuccessPage.jsx";
import MembershipSuccess from "./Pages/MembershipSuccess.jsx"; 

// --- Styles ---
import "./Styles/App.css";
import "./Styles/Index.css";

function App() {
  return (
    <div className="App-wrapper">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/membership/success" element={<MembershipSuccess />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/events/success" element={<SuccessPage />} />

          {/* Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Single Catch-All 404 Route (MUST BE LAST) */}
          <Route
            path="*"
            element={
              <div className="page-not-found">
                <h2 className="playfair">Page Not Found</h2>
                <p>The journey continues elsewhere.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;