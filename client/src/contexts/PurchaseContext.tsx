import React, { createContext, useContext, useState, useEffect } from 'react';

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  design?: any;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Purchase {
  id: string;
  userId: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

interface PurchaseContextType {
  currentCart: PurchaseItem[];
  addToCart: (item: PurchaseItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  processPurchase: (userInfo: any) => Promise<Purchase>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCart, setCurrentCart] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    console.log('🔄 PurchaseContext: Provider initialized');
    // Load cart from localStorage
    const savedCart = localStorage.getItem('tshirt_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCurrentCart(parsedCart);
        console.log('🛒 PurchaseContext: Cart loaded from localStorage:', parsedCart.length, 'items');
      } catch (error) {
        console.error('❌ PurchaseContext: Error loading cart:', error);
        localStorage.removeItem('tshirt_cart');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tshirt_cart', JSON.stringify(currentCart));
  }, [currentCart]);

  const addToCart = (item: PurchaseItem) => {
    console.log('🛒 PurchaseContext: Adding to cart:', item.productName);
    setCurrentCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    console.log('🗑️ PurchaseContext: Removing from cart:', itemId);
    setCurrentCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    console.log('🛒 PurchaseContext: Clearing cart');
    setCurrentCart([]);
    localStorage.removeItem('tshirt_cart');
  };

  const getTotalAmount = () => {
    return currentCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const processPurchase = async (userInfo: any): Promise<Purchase> => {
    console.log('🔄 PurchaseContext: Processing purchase for:', userInfo.email);
    
    const purchase: Purchase = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userInfo.id,
      items: [...currentCart],
      totalAmount: getTotalAmount(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      userEmail: userInfo.email,
      userName: userInfo.name || userInfo.email
    };

    // Save to localStorage
    const existingPurchases = JSON.parse(localStorage.getItem('all_purchases') || '[]');
    existingPurchases.push(purchase);
    localStorage.setItem('all_purchases', JSON.stringify(existingPurchases));

    console.log('✅ PurchaseContext: Purchase processed:', purchase.id);
    clearCart();
    return purchase;
  };

  const contextValue: PurchaseContextType = {
    currentCart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalAmount,
    processPurchase
  };

  // Add data attribute for debugging
  useEffect(() => {
    document.body.setAttribute('data-purchase-provider', 'true');
    return () => {
      document.body.removeAttribute('data-purchase-provider');
    };
  }, []);

  return (
    <PurchaseContext.Provider value={contextValue}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = (): PurchaseContextType => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};
