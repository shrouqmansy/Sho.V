import React from 'react';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, onRedirectToLogin }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#151616] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Authenticating Sho.V Workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (onRedirectToLogin) {
      onRedirectToLogin();
    }
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <h2 className="font-serif text-3xl text-[#151616] mb-3 uppercase tracking-wider">Access Restricted</h2>
        <p className="text-sm text-gray-600 mb-6">Please log in to access your isolated workspace environment.</p>
        <button
          onClick={onRedirectToLogin}
          className="bg-[#151616] text-white px-8 py-3 uppercase text-xs tracking-widest font-semibold hover:bg-[#bc9c85] transition-colors"
        >
          Sign In to Sho.V
        </button>
      </div>
    );
  }

  return children;
}
