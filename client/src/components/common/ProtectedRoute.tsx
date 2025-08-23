import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'staff';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');
  const expectedToken = requiredRole === 'admin' ? 'admin-token-secure' : 'staff-token-secure';

  if (!token || userRole !== requiredRole || token !== expectedToken) {
    return <Navigate to={`/${requiredRole}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;