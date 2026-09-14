import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user) {
    const hasAccount = localStorage.getItem('has_account');
    if (hasAccount) {
      return <Navigate to="/login" replace />;
    } else {
      return <Navigate to="/register" replace />;
    }
  }

  return <Outlet />;
};
