import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

const AuthCallbackPage: React.FC = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Store token (localStorage or sessionStorage)
      localStorage.setItem('auth_token', token);
      // Optionally, fetch user info here and store
      setTimeout(() => {
        setLocation('/'); // Redirect to home or dashboard
      }, 500);
    } else {
      setTimeout(() => {
        setLocation('/login');
      }, 1000);
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Signing you in with Google...</h2>
        <p className="text-gray-600">Please wait, redirecting...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 