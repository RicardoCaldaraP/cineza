
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (loading) {
    // O AppContent já mostra um spinner global
    return null;
  }

  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
