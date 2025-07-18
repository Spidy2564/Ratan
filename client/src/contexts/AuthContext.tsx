import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('🔄 AuthContext: Loading saved user:', user.email);
        setState(prev => ({ ...prev, user }));
      } catch (error) {
        console.error('❌ AuthContext: Error loading saved user:', error);
        localStorage.removeItem('current_user');
      }
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log('🔄 AuthContext: Login attempt:', email);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      let user: User;
      
      if (email === 'admin@tshirtapp.com' && password === 'admin123') {
        user = {
          id: 'admin_001',
          email: 'admin@tshirtapp.com',
          firstName: 'Admin',
          lastName: 'User',
          name: 'Admin User',
          role: 'admin'
        };
      } else if (email === 'user@test.com' && password === 'user123') {
        user = {
          id: 'user_001',
          email: 'user@test.com',
          firstName: 'Test',
          lastName: 'User',
          name: 'Test User',
          role: 'user'
        };
      } else {
        throw new Error('Invalid email or password');
      }

      if (rememberMe) {
        localStorage.setItem('current_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('current_user', JSON.stringify(user));
      }

      setState(prev => ({ ...prev, user, isLoading: false }));
      console.log('✅ AuthContext: Login successful:', user.email);
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
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user: User = {
        id: `user_${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        role: 'user'
      };

      localStorage.setItem('current_user', JSON.stringify(user));
      setState(prev => ({ ...prev, user, isLoading: false }));
      console.log('✅ AuthContext: Registration successful:', user.email);
    } catch (error: any) {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Password reset link sent to: ${email}`);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to send reset email' 
      }));
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('current_user');
    sessionStorage.removeItem('current_user');
    setState(prev => ({ ...prev, user: null }));
    console.log('🔄 AuthContext: User logged out');
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
