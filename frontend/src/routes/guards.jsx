import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

// Protect private views from unauthenticated guest profiles
export const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Guard admin/HR routes based on user role authorization
export const RoleRoute = ({ roles, allowedRoles, children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowed = roles || allowedRoles || [];
  const hasPermission = allowed.length === 0 || allowed.includes(user?.role);

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

// Direct authenticated profiles straight away from auth view panels
export const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
