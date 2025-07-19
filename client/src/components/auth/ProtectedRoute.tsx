import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'superadmin';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
  fallback,
}) => {
  const { state } = useAuth();

  // Show loading while checking authentication
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!state.isAuthenticated || !state.user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to access this page.</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Login
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  const hasRequiredRole = () => {
    const roleHierarchy = {
      'user': 1,
      'admin': 2,
      'superadmin': 3,
    };

    const userLevel = roleHierarchy[state.user?.role || 'user'];
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
  };

  if (!hasRequiredRole()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
          <p className="text-sm text-gray-500">
            Your current role: {state.user?.role || 'user'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
