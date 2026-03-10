import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import Home from "./Pages/Home.jsx";
import Events from "./Pages/Events.jsx";
import Admin from "./Pages/Admin.jsx";
import Partnership from "./Pages/Partnership.jsx";
import Membership from "./Pages/Membership.jsx";
import Login from "./Pages/Login.jsx";
import MemberProfile from "./Pages/MemberProfile.jsx";
import PartnerVault from "./Pages/PartnerVault.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* --- Public Pages --- */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/partnerships" element={<Partnership />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/login" element={<Login />} />

        {/* --- Protected Private Portals --- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/profile"
          element={
            <ProtectedRoute allowedRole="member">
              <MemberProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/vault"
          element={
            <ProtectedRoute allowedRole="partner">
              <PartnerVault />
            </ProtectedRoute>
          }
        />

        {/* --- The Catch-All Fallback --- */}
        {/* This triggers if no other path matches */}
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
