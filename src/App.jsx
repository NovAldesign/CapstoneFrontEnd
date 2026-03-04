import { Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar'; // Double check this path!
import Home from './Pages/Home';
import Events from './Pages/Events';


function App() {
  return (
  <>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
</Routes>
    </>
  );
}

export default App;
