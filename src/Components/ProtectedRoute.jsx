import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import loginService from '../Services/loginService';

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = loginService.getCurrentUser();
  const location = useLocation();

  // 1. If no user is logged in, send them to the login page
  if (!user) {
    // We save the 'from' location so we can redirect them back after they log in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If a specific role is required (admin/partner/member) but doesn't match
  if (allowedRole && user.role !== allowedRole) {
    console.warn(`Access denied: Required ${allowedRole}, but user is ${user.role}`);
    return <Navigate to="/" replace />;
  }

  // 3. If everything is clear, render the private page
  return children;
};

export default ProtectedRoute;