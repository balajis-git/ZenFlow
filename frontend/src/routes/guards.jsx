import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

// Protect private views from unauthenticated guest profiles
export const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Guard admin/HR routes based on user role authorization
export const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace /> // Fallback redirects to main dashboard
  );
};

// Direct authenticated profiles straight away from auth view panels
export const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
