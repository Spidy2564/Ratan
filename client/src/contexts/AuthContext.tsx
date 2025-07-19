import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, tokenManager } from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  phone?: string;
  isEmailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  agreeToTerms: boolean;
}

interface AuthContextType {
  user: User | null;
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  verifyAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  // Verify authentication on mount
  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async (): Promise<void> => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
        return;
      }

      const response = await authApi.verifyToken();
      if (response.success && response.user) {
        setState(prev => ({ 
          ...prev, 
          user: response.user, 
          isLoading: false, 
          isAuthenticated: true 
        }));
        console.log('✅ AuthContext: User verified:', response.user.email);
      } else {
        // Token is invalid, clear it
        tokenManager.clearTokens();
        setState(prev => ({ 
          ...prev, 
          user: null, 
          isLoading: false, 
          isAuthenticated: false 
        }));
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Token verification failed:', error);
      tokenManager.clearTokens();
      setState(prev => ({ 
        ...prev, 
        user: null, 
        isLoading: false, 
        isAuthenticated: false 
      }));
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log('🔄 AuthContext: Login attempt:', email);

    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.user && response.token) {
        // Store tokens
        tokenManager.setTokens(response.token, response.refreshToken);
        
        // Store user data
        const userData = {
          id: response.user._id || response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          name: response.user.name || `${response.user.firstName} ${response.user.lastName}`,
          role: response.user.role || 'user',
          phone: response.user.phone,
          isEmailVerified: response.user.isEmailVerified,
        };

        if (rememberMe) {
          localStorage.setItem('current_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('current_user', JSON.stringify(userData));
        }

        setState(prev => ({ 
          ...prev, 
          user: userData, 
          isLoading: false, 
          isAuthenticated: true 
        }));
        console.log('✅ AuthContext: Login successful:', userData.email);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Login failed' 
      }));
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        agreeToTerms: data.agreeToTerms,
      });

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        console.log('✅ AuthContext: Registration successful, verification email sent');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Registration error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Registration failed' 
      }));
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        console.log('✅ AuthContext: Password reset email sent to:', email);
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Forgot password error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to send reset email' 
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to invalidate tokens on server
      await authApi.logout();
    } catch (error) {
      console.error('❌ AuthContext: Logout API error:', error);
    } finally {
      // Clear local storage regardless of API call success
      tokenManager.clearTokens();
      localStorage.removeItem('current_user');
      sessionStorage.removeItem('current_user');
      setState(prev => ({ 
        ...prev, 
        user: null, 
        isAuthenticated: false 
      }));
      console.log('🔄 AuthContext: User logged out');
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    user: state.user,
    state,
    login,
    register,
    forgotPassword,
    logout,
    clearError,
    verifyAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
