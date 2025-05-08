
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Pode mostrar um spinner de carregamento aqui
    return <div>Carregando...</div>; 
  }

  if (!currentUser) {
    // Redireciona para a página de login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }

  // Renderiza o conteúdo da rota se autenticado
  return children ? children : <Outlet />; 
};

export default ProtectedRoute;
