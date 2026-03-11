import React from 'react';
import { Routes, Route } from 'react-router-dom'; 

// --- Components & Pages ---
import Navbar from './components/Navbar.jsx'; 
import Home from './pages/Home.jsx';
import Membership from './Pages/Membership.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx'; 
import Login from './Pages/Login.jsx';


import Events from './Pages/Events'; 
import Partnerships from './Pages/Partnership.jsx'; 

// --- Styles ---
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      
      <main className="content-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Match Navbar: to="/events" */}
          <Route path="/events" element={<Events />} />
          
          {/* Match Navbar: to="/membership" */}
          <Route path="/membership" element={<Membership />} />
          
          {/* Match Navbar: to="/partnerships" */}
          <Route path="/partnerships" element={<Partnerships />} />

          {/* Match Navbar: to="/admin/dashboard" */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* 404 Fallback */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '100px' }}>
              <h2 className="playfair">Page Not Found</h2>
              <p>The journey continues elsewhere.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
