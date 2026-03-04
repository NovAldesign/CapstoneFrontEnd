import { Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar.jsx'; 
import Home from '../src/Pages/Home.jsx';
import Events from '..//src/Pages/Events.jsx';


function App() {
  return (
  <>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
       <Route path="/partnership" element={<Partnership />} />
        <Route path="/applicant" element={<Applicant />} />
         <Route path="/admin" element={<Admin/>} />
</Routes>
    </>
  );
}

export default App;
