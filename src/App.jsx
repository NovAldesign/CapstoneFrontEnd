import React from "react";
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// --- Components ---
import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";

// --- Context ---
import { CartProvider } from "./Context/CartContext.jsx";

// --- Pages ---
import Home from "./Pages/Home.jsx";
import Events from "./Pages/Events.jsx";
import EventDetail from "./Pages/EventDetail.jsx";
import Blog from "./Pages/Blog.jsx";
import BlogPost from "./Pages/BlogPost.jsx";
import Membership from "./Pages/Membership.jsx";
import Partnerships from "./Pages/Partnership.jsx";
import MemberPerks from "./Pages/MemberPerks.jsx";
import About from "./Pages/About.jsx";
import Contact from "./Pages/Contact.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";
import CheckIn from "./Pages/CheckIn.jsx";
import Gift from "./Pages/Gift.jsx";
import Shop from "./Pages/Shop.jsx";
import ShopSuccess from "./Pages/ShopSuccess.jsx";
import { rememberSource } from "./Services/ticketSources.js";
import SuccessPage from "./Pages/SuccessPage.jsx";
import MembershipSuccess from "./Pages/MembershipSuccess.jsx";
import GroupBooking from "./Pages/GroupBooking.jsx";
import Perform from "./Pages/Perform.jsx";
import Legal from "./Pages/Legal.jsx";
import Links from "./Pages/Links.jsx";
import Go from "./Pages/Go.jsx";
import Host from "./Pages/Host.jsx";
import HostLanding from "./Pages/HostLanding.jsx";
import Login from "./Pages/Login.jsx";
import MemberLoginLink from "./Pages/MemberLoginLink.jsx";
import MemberDashboard from "./Pages/MemberDashboard.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import Select from "./Pages/Select.jsx";
import SelectInvitation from "./Pages/SelectInvitation.jsx";
import SelectNominate from "./Pages/SelectNominate.jsx";
import SelectAudience from "./Pages/SelectAudience.jsx";

// --- Styles ---
import "./Styles/App.css";
import "./Styles/Index.css";

function App() {
  // The link-in-bio page shows without the top navigation
  const { pathname, search } = useLocation();
  const isLinks = pathname === "/links";
  // Door check-in has its own full-screen layout
  const isCheckIn = pathname.startsWith("/checkin/");

  // Remember which post sent this visitor (?src=threads-m), so ticket sales show where they came from
  useEffect(() => { rememberSource(search); }, [search]);
  // GFC Select™ pages have their own quiet header and footer
  const isSelect = pathname === "/select" || pathname.startsWith("/select/");
  // Hosting pages for apartments and companies get the corporate footer (hosting number + planner sign-up)
  const isCorporatePage = ["/host", "/corporate-team-building-atlanta", "/office-holiday-party-atlanta"].includes(pathname.replace(/\/$/, ""));

  return (
    <CartProvider>
      <div className="App-wrapper">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {!isLinks && !isSelect && !isCheckIn && <Navbar />}

        <main className="main-content" id="main-content" tabIndex={-1}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/checkin/:eventId" element={<CheckIn />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/success" element={<SuccessPage />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/membership/success" element={<MembershipSuccess />} />
            <Route path="/gift" element={<Gift />} />
            <Route path="/gift/success" element={<ShopSuccess kind="gift" />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/success" element={<ShopSuccess kind="merch" />} />
            <Route path="/celebrate" element={<GroupBooking />} />
            <Route path="/host" element={<Host />} />
            <Route path="/corporate-team-building-atlanta" element={<HostLanding page="teamBuilding" />} />
            <Route path="/office-holiday-party-atlanta" element={<HostLanding page="holiday" />} />
            <Route path="/perform" element={<Perform key="artist" />} />
            <Route path="/perform/host" element={<Perform key="host" role="host" />} />
            <Route path="/select" element={<Select />} />
            <Route path="/select/invitation" element={<SelectInvitation />} />
            <Route path="/select/nominate" element={<SelectNominate />} />
            <Route path="/select/gentlemen" element={<SelectAudience gender="man" key="man" />} />
            <Route path="/select/ladies" element={<SelectAudience gender="woman" key="woman" />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/partnerships" element={<Partnerships />} />
            <Route path="/partnerships/perks" element={<MemberPerks />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/links" element={<Links />} />
            <Route path="/go/:code" element={<Go />} />

            {/* Policies */}
            <Route path="/privacy" element={<Legal page="privacy" />} />
            <Route path="/terms" element={<Legal page="terms" />} />
            <Route path="/waiver" element={<Legal page="waiver" />} />
            <Route path="/refund-policy" element={<Legal page="refunds" />} />
            <Route path="/code-of-conduct" element={<Legal page="conduct" />} />
            <Route path="/photo-policy" element={<Legal page="photos" />} />
            <Route path="/accessibility" element={<Legal page="accessibility" />} />
            <Route path="/performer-agreement" element={<Legal page="performer" />} />
          

            <Route path="/login" element={<Login />} />
            <Route path="/member/login/:token" element={<MemberLoginLink />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute allowedRole="member">
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/member" element={<Navigate to="/member/dashboard" replace />} />
            <Route path="/member/profile" element={<Navigate to="/member/dashboard" replace />} />

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
        {!isSelect && !isCheckIn && <Footer variant={isCorporatePage ? "corporate" : "default"} />}
      </div>
    </CartProvider>
  );
}

export default App;