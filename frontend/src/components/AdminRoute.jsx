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

    // 1) direct role string: { rol: 'ADMIN' } or { role: 'ADMIN' }
    const roleString = user?.rol || user?.role;
    if (roleString && typeof roleString === 'string') {
      const r = roleString.toUpperCase();
      if (r === 'ADMIN' || r === 'ROLE_ADMIN') return true;
    }

    // 2) roles/authorities arrays
    const roles = user?.roles || user?.authorities || user?.authority;
    if (typeof roles === 'string') {
      const r = roles.toUpperCase();
      if (r === 'ADMIN' || r === 'ROLE_ADMIN') return true;
    }

    if (Array.isArray(roles)) {
      if (roles.some(item => {
        if (!item) return false;
        if (typeof item === 'string') {
          const s = item.toUpperCase();
          return s === 'ADMIN' || s === 'ROLE_ADMIN' || s.includes('ADMIN');
        }
        // object shapes: { authority: 'ROLE_ADMIN' } or { name: 'ADMIN' }
        const authority = String(item.authority || item.name || item.role || '').toUpperCase();
        return authority === 'ADMIN' || authority === 'ROLE_ADMIN' || authority.includes('ADMIN');
      })) return true;
    }

    // 3) Fallback: inspect whole user json for the string ADMIN
    try {
      const s = JSON.stringify(user || {}).toUpperCase();
      return s.includes('ADMIN');
    } catch (e) {
      return false;
    }
  };

  if (isAdminRole()) return children;

  return <Navigate to="/" replace />;
};

export default AdminRoute;
