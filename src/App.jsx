import React from 'react';
import { Routes, Route } from 'react-router-dom'; 

// --- Components & Pages ---
import Navbar from './components/Navbar.jsx'; 
import Home from './pages/Home.jsx';
import Membership from './Pages/Membership.jsx'; // Note: Ensure casing matches your file system
import AdminDashboard from './Pages/AdminDashboard.jsx'; 
import Login from './Pages/Login.jsx';
import Events from './Pages/Events'; 
import Partnerships from './Pages/Partnership.jsx'; 

// --- Styles ---
import './App.css';
import './index.css'; 

function App() {
  return (
    
    <div className="App-wrapper">
      <Navbar />
      
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events" element={<Events />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="*" element={
            <div className="page-not-found">
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
