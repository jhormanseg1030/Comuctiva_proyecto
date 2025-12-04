import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  // Flexible role detection: support multiple shapes returned by backend
  const isAdminRole = () => {
    if (!user) return false;
    const roleString = user?.rol || user?.role;
    if (roleString && typeof roleString === 'string') {
      return roleString === 'ADMIN' || roleString === 'ROLE_ADMIN';
    }

    const roles = user?.roles || user?.authorities || user?.authority || [];
    if (typeof roles === 'string') {
      return roles === 'ADMIN' || roles === 'ROLE_ADMIN';
    }

    if (Array.isArray(roles)) {
      return roles.some(r => {
        if (!r) return false;
        if (typeof r === 'string') return r === 'ADMIN' || r === 'ROLE_ADMIN';
        // object shape: { authority: 'ROLE_ADMIN' } or { name: 'ADMIN' }
        return (r.authority === 'ROLE_ADMIN' || r.authority === 'ADMIN' || r.name === 'ADMIN');
      });
    }

    // Fallback: inspect user JSON for ADMIN
    try {
      const s = JSON.stringify(user || {});
      return /"?ADMIN"?/i.test(s);
    } catch (e) {
      return false;
    }
  };

  if (isAdminRole()) return children;

  return <Navigate to="/" replace />;
};

export default AdminRoute;
