import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import loginService from "../Services/loginService"; 
import "../Styles/Navbar.css";
import logo from "../assets/gfcLogo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const user = loginService.getCurrentUser();

  const handleLogout = () => {
    loginService.logout();
    navigate("/login");
  };

  return (
    <nav className="gfc-navbar">
      <div className="nav-left">
        <Link to="/">
          <img src={logo} className="nav-logo" alt="GFC logo" />
        </Link>
      </div>

      {/* All links grouped together to keep Admin next to Partnerships */}
      <ul className="nav-links">
        <li><NavLink to="/" className="btn">Home</NavLink></li>
        <li><NavLink to="/events" className="btn">Events</NavLink></li>
        <li><NavLink to="/membership" className="btn">Membership</NavLink></li>
        <li><NavLink to="/partnerships" className="btn">Partnerships</NavLink></li>
        
        {user && user.role === 'admin' && (
          <li><NavLink to="/admin/dashboard" className="btn">Admin</NavLink></li>
        )}
      </ul>

      <div className="nav-right">
        {user ? (
          <button onClick={handleLogout} className="logout-btn-styled">
            LOGOUT ({user.name.split(' ')[0]})
          </button>
        ) : (
          <NavLink to="/login" className="btn login-link">Login</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;