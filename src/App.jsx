import { Routes, Route } from "react-router-dom"; 
import Navbar from "./Components/Navbar.jsx";
import Home from "./Pages/Home.jsx";
import Events from "./Pages/Events.jsx";
import Admin from "./Pages/Admin.jsx";
import Partnership from "./Pages/Partnership.jsx";
import Membership from "./Pages/Membership.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/partnerships" element={<Partnership />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;