import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRedirect = (redirectTo: string = '/') => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (state.isAuthenticated) {
      // Get the intended destination from location state, or use default
      const from = (location.state as any)?.from?.pathname || redirectTo;
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, location, redirectTo]);
};