import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthRouteProps {
  element: React.ReactElement;
  requireAuth?: boolean;
}

/**
 * AuthRoute - A component for handling authenticated routes
 * @param element - The element to render if authorized
 * @param requireAuth - If true, redirects to login if not authenticated. If false, redirects to home if authenticated.
 */
const AuthRoute: React.FC<AuthRouteProps> = ({ element, requireAuth = true }) => {
  const { user, isLoading } = useAuth();
  
  // If still loading auth state, show nothing (or could show a loading spinner)
  if (isLoading) {
    return <div>Loading...</div>; // Could be replaced with a proper loading component
  }
  
  // If we require authentication and user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }
  
  // If we require guest access only and user is logged in, redirect to home
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise, render the requested element
  return element;
};

export default AuthRoute; 