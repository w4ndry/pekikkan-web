import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Prevent back button access after logout
  useEffect(() => {
    const handlePopState = () => {
      if (!user) {
        window.history.pushState(null, '', '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Push current state to prevent back navigation
    if (!user && location.pathname !== '/') {
      window.history.pushState(null, '', location.pathname);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};