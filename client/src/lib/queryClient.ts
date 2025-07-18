// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized settings for the anime store
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Keep data in cache for 10 minutes after it becomes unused
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      
      // Retry failed requests up to 3 times
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus for important data
      refetchOnWindowFocus: true,
      
      // Don't refetch on reconnect for cached data
      refetchOnReconnect: 'always',
      
      // Don't refetch when component mounts if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Custom query keys for better organization
export const queryKeys = {
  // Products
  products: ['products'] as const,
  productList: (filters?: Record<string, any>) => 
    [...queryKeys.products, 'list', filters] as const,
  productDetail: (id: number) => 
    [...queryKeys.products, 'detail', id] as const,
  productCategories: ['products', 'categories'] as const,
  featuredProducts: ['products', 'featured'] as const,
  
  // Admin
  adminProducts: ['admin-products'] as const,
  
  // Contact
  contactSubmissions: ['contact', 'submissions'] as const,
  
  // User/Session
  user: ['user'] as const,
  userProfile: (id: number) => [...queryKeys.user, id] as const,
} as const;

// Utility functions for cache management
export const cacheUtils = {
  // Invalidate all product-related queries
  invalidateProducts: () => {
    return queryClient.invalidateQueries({ 
      queryKey: queryKeys.products 
    });
  },
  
  // Invalidate admin products
  invalidateAdminProducts: () => {
    return queryClient.invalidateQueries({ 
      queryKey: queryKeys.adminProducts 
    });
  },
  
  // Clear all caches (useful for logout)
  clearAll: () => {
    queryClient.clear();
  },
  
  // Prefetch products for better UX
  prefetchProducts: async (filters?: Record<string, any>) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.productList(filters),
      queryFn: () => fetchProducts(filters),
      staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    });
  },
  
  // Set product data in cache (useful after mutations)
  setProductData: (id: number, data: any) => {
    queryClient.setQueryData(queryKeys.productDetail(id), data);
  },
  
  // Remove specific product from cache
  removeProduct: (id: number) => {
    queryClient.removeQueries({ 
      queryKey: queryKeys.productDetail(id) 
    });
  },
};

// API fetch function (you can move this to a separate api.ts file)
const API_BASE = window.location.port === '5000' ? '' : 'http://localhost:5000';

async function fetchProducts(filters?: Record<string, any>) {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  
  const url = `${API_BASE}/api/products${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch products`);
  }
  
  const data = await response.json();
  return data.data || data;
}

// Performance monitoring for React Query (development only)
if (process.env.NODE_ENV === 'development') {
  // Log slow queries
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === 'observerAdded') {
      const startTime = Date.now();
      
      event.query.promise?.then(() => {
        const duration = Date.now() - startTime;
        if (duration > 1000) {
          console.warn(`🐌 Slow query detected:`, {
            queryKey: event.query.queryKey,
            duration: `${duration}ms`,
          });
        }
      });
    }
  });

  // Log cache statistics periodically
  if (typeof window !== 'undefined') {
    setInterval(() => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      const active = queries.filter(q => q.getObserversCount() > 0);
      
      console.log('📊 React Query Cache Stats:', {
        totalQueries: queries.length,
        activeQueries: active.length,
        staleQueries: queries.filter(q => q.isStale()).length,
      });
    }, 30000); // Every 30 seconds
  }
}

export default queryClient;