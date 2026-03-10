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

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public  Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/partnerships" element={<Partnership />} />
        <Route path="/membership" element={<Membership />} />
        
        {/* The Gateway */}
        <Route path="/login" element={<Login />} />

        {/* Private Portals (Accessed after Login) */}
        <Route path="/admin/dashboard" element={<Admin />} />
        <Route path="/member/profile" element={<MemberProfile />} />
        <Route path="/partner/vault" element={<PartnerVault />} />
      </Routes>
    </>
  );
}

export default App;