// ================================
// 📁 src/lib/api.ts - API Utility Functions
// ================================

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  token?: string;
  refreshToken?: string;
  error?: string;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API request failed:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      500
    );
  }
}

// Auth API functions
export const authApi = {
  // Register user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    agreeToTerms: boolean;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Verify email
  verifyEmail: async (token: string) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Verify token (check if user is authenticated)
  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },

  // Logout
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// Token management
export const tokenManager = {
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('auth_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },

  getAccessToken: () => {
    return localStorage.getItem('auth_token');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },

  clearTokens: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

export { ApiError };
export default apiRequest; 