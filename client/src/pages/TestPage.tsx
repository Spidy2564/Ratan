import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { AddToCartButton } from '../components/AddToCartButton';
import { WishlistButton } from '../components/WishlistButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function TestPage() {
  const { user } = useAuth();
  const { state: cartState, clearCart } = useCart();
  const { state: wishlistState, clearWishlist } = useWishlist();

  const testProduct = {
    id: 1,
    name: "Test Anime T-Shirt",
    price: "29.99",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    category: "T-Shirts"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Cart & Wishlist Test</h1>
        
        {!user ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Please login to test cart and wishlist functionality</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Test Product */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Test Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={testProduct.imageUrl} 
                    alt={testProduct.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{testProduct.name}</h3>
                    <p className="text-gray-400">₹{testProduct.price}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <AddToCartButton product={testProduct} />
                  <WishlistButton product={testProduct} />
                </div>
              </CardContent>
            </Card>

            {/* Cart Status */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Cart Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Items in cart: {cartState.cart?.itemCount || 0}</p>
                <p>Total amount: ₹{cartState.cart?.totalAmount?.toFixed(2) || '0.00'}</p>
                {cartState.cart?.items.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Cart Items:</h4>
                    {cartState.cart.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-400">
                        {item.productName} - ₹{item.price} x {item.quantity}
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  onClick={clearCart}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Cart
                </Button>
              </CardContent>
            </Card>

            {/* Wishlist Status */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Wishlist Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Items in wishlist: {wishlistState.wishlist?.itemCount || 0}</p>
                {wishlistState.wishlist?.items.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Wishlist Items:</h4>
                    {wishlistState.wishlist.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-400">
                        {item.productName} - ₹{item.price}
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  onClick={clearWishlist}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Wishlist
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 