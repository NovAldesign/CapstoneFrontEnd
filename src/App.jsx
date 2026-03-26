import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Components ---
import Navbar from './Components/Navbar.jsx';
import Footer from './Components/Footer.jsx';

// --- Pages ---
import Home from './pages/Home.jsx';
import Events from './Pages/Events.jsx';
import Travel from './Pages/Travel.jsx';
import IntentionalDinners from './Pages/IntentionalDinners.jsx';
import Membership from './Pages/Membership.jsx';
import Partnerships from './Pages/Partnership.jsx';
import About from './Pages/About.jsx';
import Contact from './Pages/Contact.jsx';
import Login from './Pages/Login.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';

// --- New Stripe Checkout Pages ---
import CheckoutPage from './Pages/CheckoutPage.jsx';
import SuccessPage from './Pages/SuccessPage.jsx';

// --- Styles ---
import './App.css';
import './index.css';

function App() {
  return (
    <div className="App-wrapper">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/events"        element={<Events />} />
          <Route path="/travel"        element={<Travel />} />
          <Route path="/ic-dinners"    element={<IntentionalDinners />} />
          <Route path="/membership"    element={<Membership />} />
          <Route path="/partnerships"  element={<Partnerships />} />
          <Route path="/about"         element={<About />} />
          <Route path="/contact"       element={<Contact />} />
          <Route path="/login"         element={<Login />} />

          {/* Dynamic Checkout Route */}
          <Route path="/checkout/:eventId" element={<CheckoutPage />} />
          <Route path="/success"           element={<SuccessPage />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="*" element={
            <div className="page-not-found">
              <h2 className="playfair">Page Not Found</h2>
              <p>The journey continues elsewhere.</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />  
    </div>
  );
}

export default App;