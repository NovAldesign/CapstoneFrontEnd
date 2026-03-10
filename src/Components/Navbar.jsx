import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import loginService from "../Services/loginService"; 
import "../Styles/Navbar.css";
import logo from "../assets/gfcLogo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const user = loginService.getCurrentUser(); // Check if anyone is logged in

  const handleLogout = () => {
    loginService.logout();
    navigate("/login");
  };

  return (
    <nav className="container">
      <Link to="/">
        <img
          src={logo}
          className="nav-logo"
          alt="Grown Folks Collective logo, navy blue and gold, with white background."
        />
      </Link>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className="btn">Home</NavLink>
        </li>
        <li>
          <NavLink to="/events" className="btn">Events</NavLink>
        </li>
        <li>
          <NavLink to="/membership" className="btn">Membership</NavLink>
        </li>
        <li>
          <NavLink to="/partnerships" className="btn">Partnerships</NavLink>
        </li>

        {/* --- DYNAMIC LINKS BASED ON LOGIN STATUS --- */}
        {user ? (
          <>
            {/* Show the relevant Portal link based on their role */}
            {user.role === 'admin' && (
              <li><NavLink to="/admin/dashboard" className="btn">Admin</NavLink></li>
            )}
            {user.role === 'member' && (
              <li><NavLink to="/member/profile" className="btn">My Profile</NavLink></li>
            )}
            {user.role === 'partner' && (
              <li><NavLink to="/partner/vault" className="btn">Partner Vault</NavLink></li>
            )}
            
            <li>
              <button onClick={handleLogout} className="btn logout-btn">
                Logout ({user.name})
              </button>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login" className="btn">Login</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;