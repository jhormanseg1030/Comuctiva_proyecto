import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  const rol = user?.rol || user?.roles || user?.authority;
  if (rol === 'ADMIN' || rol === 'ROLE_ADMIN') return children;

  return <Navigate to="/" replace />;
};

export default AdminRoute;
