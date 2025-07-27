import React, { useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trash2, Heart, ShoppingCart, ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'wouter';

export default function WishlistPage() {
  const { state: wishlistState, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Wishlist</h1>
            <p className="text-gray-400 mb-6">Please login to view your wishlist</p>
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    setLoading(true);
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: any) => {
    setLoading(true);
    try {
      await addToCart({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearWishlist = async () => {
    setLoading(true);
    try {
      await clearWishlist();
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!wishlistState.wishlist || wishlistState.wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-400 mb-6">Start adding products to your wishlist!</p>
            <Link href="/products">
              <Button className="bg-red-600 hover:bg-red-700">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Button 
            variant="outline" 
            onClick={handleClearWishlist}
            disabled={loading}
            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistState.wishlist.items.map((item) => (
            <Card key={item._id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-4">
                <div className="relative">
                  <img
                    src={item.imageUrl || '/placeholder-product.jpg'}
                    alt={item.productName}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    disabled={loading}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {item.productName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">₹{item.price}</span>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      disabled={loading}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Quick View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/products">
            <Button variant="outline" className="mr-4">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/cart">
            <Button className="bg-red-600 hover:bg-red-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 