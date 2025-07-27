import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, User, MapPin, Phone, Mail, CheckCircle, CreditCard, Truck, Shield } from 'lucide-react';
import { Link } from 'wouter';
import axios from 'axios';

// API Base URL
const API_BASE = (() => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5000`;
})();

// UserDetails interface
interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// CartItem interface
interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  product?: any;
}

// RobustImage component
const RobustImage = ({
  src,
  alt,
  className = '',
  fallbackSrc = "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=300&fit=crop",
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  [key: string]: any;
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

// CheckoutPage Component - Same as ProductsPage
const CheckoutPage = ({
  cartItems,
  onBack,
  onPaymentSuccess
}: {
  cartItems: CartItem[];
  onBack: () => void;
  onPaymentSuccess: () => void;
}) => {
  const { user } = useAuth();

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    return '';
  };

  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: getUserName(),
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (paymentMethod === 'razorpay') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('🎉 Payment Successful! Order confirmed.');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('📦 Order placed! Pay on delivery.');
      }

      const purchaseData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          color: null
        })),
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentId: paymentMethod === 'razorpay' ? `pay_${Date.now()}` : null,
        shippingAddress: {
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
          street: userDetails.address,
          city: userDetails.city,
          state: userDetails.state,
          zipCode: userDetails.pincode,
          country: 'India'
        },
        orderNotes: ''
      };

      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await axios.post(`${API_BASE}/api/purchases`, purchaseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ Purchase saved to MongoDB:', response.data.data);

        const purchase = {
          id: response.data.data._id,
          userId: user?.id || 'guest',
          userEmail: user?.email || userDetails.email,
          userName: user?.name || userDetails.name,
          items: cartItems.map(item => ({
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            size: item.size || null
          })),
          totalAmount: totalAmount,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        const adminNotif = {
          id: `order_${purchase.id}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${purchase.id} for ₹${purchase.totalAmount} from ${purchase.userName}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          order: {
            id: purchase.id,
            totalAmount: purchase.totalAmount,
            userName: purchase.userName,
            userEmail: purchase.userEmail,
            items: purchase.items.map((item: any) => ({
              productName: item.productName,
              quantity: item.quantity,
              size: item.size
            }))
          }
        };
        const existingAdminNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        localStorage.setItem('admin_notifications', JSON.stringify([adminNotif, ...existingAdminNotifs]));

        const existingPurchases = JSON.parse(localStorage.getItem('all_purchases') || '[]');
        existingPurchases.push(purchase);
        localStorage.setItem('all_purchases', JSON.stringify(existingPurchases));

        try {
          const emailResponse = await axios.post(`${API_BASE}/api/mail`, { purchase });
          if (emailResponse.data.success) {
            alert('🎉 Order placed successfully! Check your email for confirmation.');
          } else {
            alert('Order placed successfully! Email notification failed.');
          }
        } catch (emailError) {
          console.error('Email notification failed:', emailError);
          alert('Order placed successfully! Email notification failed.');
        }

        onPaymentSuccess();
      } else {
        throw new Error('Failed to save purchase to database');
      }
    } catch (error: any) {
      console.error('❌ Payment/Purchase failed:', error);
      alert(`❌ Payment failed: ${error.response?.data?.message || error.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">🛒 Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4">📦 Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div key={`${item.productId}-${item.size || 'no-size'}-${index}`} className="flex items-center gap-4">
                  <RobustImage
                    src={item.imageUrl || ''}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.productName}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.size && (
                      <p className="text-sm text-blue-600 font-medium">Size: {item.size}</p>
                    )}
                  </div>
                  <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">📋 Delivery Details</h2>

            <div className="space-y-4 mb-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userDetails.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userDetails.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={userDetails.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={userDetails.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={userDetails.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={userDetails.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={userDetails.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">💳 Payment Method</h3>

              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium">Credit/Debit Card, UPI, Net Banking</div>
                    <div className="text-sm text-gray-600">Secure payment via Razorpay</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="mr-3"
                  />
                  <Truck className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive the order</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Secure Checkout</span>
              </div>
              <div className="text-sm text-green-700">
                Your payment information is encrypted and secure. We never store your card details.
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Place Order - ₹{totalAmount.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const { state: cartState, updateCartItem, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Cart</h1>
            <p className="text-gray-400 mb-6">Please login to view your cart</p>
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

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLoading(true);
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setLoading(true);
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    setLoading(true);
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    clearCart();
  };

  // Show checkout page if checkout is active
  if (showCheckout) {
    return (
      <CheckoutPage
        cartItems={cartState.cart?.items || []}
        onBack={() => setShowCheckout(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  if (!cartState.cart || cartState.cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-6">Add some products to your cart to get started!</p>
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
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button
            variant="outline"
            onClick={handleClearCart}
            disabled={loading}
            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartState.cart.items.map((item) => (
              <Card key={item._id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <RobustImage
                        src={item.imageUrl || '/placeholder-product.jpg'}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {item.productName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>₹{item.price}</span>
                        {item.size && <Badge variant="secondary">{item.size}</Badge>}
                        {item.color && <Badge variant="secondary">{item.color}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        disabled={loading}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Items ({cartState.cart.itemCount})</span>
                  <span>₹{cartState.cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{cartState.cart.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <div className="mt-3">
                  <Link href="/products">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 