import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface WishlistItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  imageUrl?: string;
  category?: string;
  addedAt: string;
}

interface Wishlist {
  _id?: string;
  userId?: string;
  items: WishlistItem[];
  itemCount: number;
}

interface WishlistState {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WISHLIST'; payload: Wishlist }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' };

const WishlistContext = createContext<{
  state: WishlistState;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (item: Omit<WishlistItem, '_id' | 'addedAt'>) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  checkWishlistStatus: (productId: string) => Promise<boolean>;
} | undefined>(undefined);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload, error: null };
    case 'ADD_ITEM':
      if (!state.wishlist) return state;
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          items: [...state.wishlist.items, action.payload],
        },
      };
    case 'REMOVE_ITEM':
      if (!state.wishlist) return state;
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          items: state.wishlist.items.filter(item => item.productId !== action.payload),
        },
      };
    case 'CLEAR_WISHLIST':
      if (!state.wishlist) return state;
      return {
        ...state,
        wishlist: { ...state.wishlist, items: [] },
      };
    default:
      return state;
  }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, {
    wishlist: null,
    loading: false,
    error: null,
  });

  const fetchWishlist = async () => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        dispatch({ type: 'SET_WISHLIST', payload: response.data.data });
      } else {
        throw new Error(response.data.message || 'Failed to fetch wishlist');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToWishlist = async (item: Omit<WishlistItem, '_id' | 'addedAt'>) => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await axios.post('http://localhost:5000/api/wishlist/add', item, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        dispatch({ type: 'SET_WISHLIST', payload: response.data.data });
      } else {
        throw new Error(response.data.message || 'Failed to add item to wishlist');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item to wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await axios.delete('http://localhost:5000/api/wishlist/remove', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: { productId },
      });
      
      if (response.data.success) {
        dispatch({ type: 'SET_WISHLIST', payload: response.data.data });
      } else {
        throw new Error(response.data.message || 'Failed to remove item from wishlist');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item from wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearWishlist = async () => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await axios.delete('http://localhost:5000/api/wishlist/clear', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        dispatch({ type: 'SET_WISHLIST', payload: response.data.data });
      } else {
        throw new Error(response.data.message || 'Failed to clear wishlist');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to clear wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const checkWishlistStatus = async (productId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await axios.get(`http://localhost:5000/api/wishlist/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        return response.data.isInWishlist;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      dispatch({ type: 'SET_WISHLIST', payload: { items: [], itemCount: 0 } });
    }
  }, [user]);

  return (
    <WishlistContext.Provider
      value={{
        state,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        checkWishlistStatus,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 