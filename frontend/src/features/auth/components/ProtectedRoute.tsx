import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          <p className="text-xs text-gray-500 font-medium">Verifying workspace session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md p-6 rounded-xl border border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-950">Access Restricted</h2>
          <p className="text-xs text-gray-500">
            Your role (<span className="font-semibold text-gray-800">{user.role}</span>) does not have permission to view this section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
