import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext'; // Add this import
import AuthModal from '../components/auth/AuthModal'; // Add this import
import { Search, Filter, Star, ShoppingCart, Eye, Grid, List, Loader2, Heart, ShoppingBag, Truck, Shield, RotateCcw, AlertCircle, X, ChevronLeft, ChevronRight, Zap, Plus, Minus, Trash2, ArrowRight, CreditCard, User, MapPin, Phone, Mail, CheckCircle, ArrowLeft, Share2, Package, Ruler, Info } from 'lucide-react';

// Types for your API
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  featured: boolean;
  tags?: string;
  images?: string | string[]; // Can be JSON string or array
  discountPercent?: number; // Add consistent discount field
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  size?: string; // Add size to cart items
}

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}



// Size chart data
const SIZE_CHART = {
  'T-Shirts': {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    measurements: {
      'XS': { chest: '34-36', length: '26', shoulder: '16' },
      'S': { chest: '36-38', length: '27', shoulder: '17' },
      'M': { chest: '38-40', length: '28', shoulder: '18' },
      'L': { chest: '40-42', length: '29', shoulder: '19' },
      'XL': { chest: '42-44', length: '30', shoulder: '20' },
      'XXL': { chest: '44-46', length: '31', shoulder: '21' }
    }
  },
  'Hoodies': {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    measurements: {
      'XS': { chest: '36-38', length: '25', shoulder: '17' },
      'S': { chest: '38-40', length: '26', shoulder: '18' },
      'M': { chest: '40-42', length: '27', shoulder: '19' },
      'L': { chest: '42-44', length: '28', shoulder: '20' },
      'XL': { chest: '44-46', length: '29', shoulder: '21' },
      'XXL': { chest: '46-48', length: '30', shoulder: '22' }
    }
  }
};

// ✅ FIXED: Consistent API Base URL with admin page
const API_BASE = (() => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // Always use port 5000 for API calls
  return `${protocol}//${hostname}:5000`;
})();

console.log('🔧 API_BASE configured as:', API_BASE);

// ✅ FIXED: Helper function to resolve image URLs
const resolveImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';

  console.log('🔍 Resolving image URL:', imageUrl);

  // If it's already a complete URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('✅ Complete URL detected:', imageUrl);
    return imageUrl;
  }

  // Build the base URL - always use localhost:5000
  const baseUrl = 'http://localhost:5000';

  // Handle relative URLs starting with /uploads
  if (imageUrl.startsWith('/uploads/')) {
    const resolvedUrl = baseUrl + imageUrl;
    console.log('✅ Resolved uploads URL:', resolvedUrl);
    return resolvedUrl;
  }

  // Handle other relative URLs
  if (imageUrl.startsWith('/')) {
    const resolvedUrl = baseUrl + imageUrl;
    console.log('✅ Resolved relative URL:', resolvedUrl);
    return resolvedUrl;
  }

  // Default case - assume it's a filename and add /uploads/
  const resolvedUrl = `${baseUrl}/uploads/${imageUrl}`;
  console.log('✅ Resolved filename URL:', resolvedUrl);
  return resolvedUrl;
};
const handlePaymentSuccess = async () => {
  try {
    // Your existing success logic...
    setCartItems([]);
    setCart(new Set());
    setShowCheckout(false);

    // NEW: Send order data to trigger notifications
    const orderData = {
      userId: user?.id || 'guest',
      userEmail: user?.email || userDetails.email,
      userName: user?.name || userDetails.name,
      items: cartItems.map(item => ({
        productId: item.product.id.toString(),
        productName: item.product.name,
        price: parseFloat(item.product.price),
        quantity: item.quantity,
        size: item.size || null
      })),
      totalAmount: cartItems.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0),
      paymentMethod: paymentMethod, // 'razorpay' or 'cod'
      shippingAddress: userDetails,
      phone: userDetails.phone,
      address: userDetails.address
    };

    console.log('📦 Sending order data:', orderData);

    // Send order to server (this will trigger admin notifications)
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Order created successfully:', result.data);
      console.log('📡 Admin notification sent:', result.notificationSent);
      alert('🎉 Order placed successfully! Admins have been notified.');
    } else {
      console.error('❌ Order creation failed:', result.message);
      alert('❌ Order failed: ' + result.message);
    }

  } catch (error) {
    console.error('❌ Order submission error:', error);
    alert('❌ Failed to submit order. Please try again.');
  }
};

// ✅ FIXED: API functions with consistent response handling
const fetchProducts = async (filters?: { category?: string; featured?: boolean; inStock?: boolean }): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
  if (filters?.inStock !== undefined) params.append('inStock', filters.inStock.toString());

  const url = `${API_BASE}/api/products${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('🔗 Products: Fetching from:', url);

  try {
    const response = await fetch(url);
    console.log('📡 Products: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Products: API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Products: API Response:', data);

    // ✅ FIXED: Handle both response formats consistently
    const products = data.data || data;
    console.log('📦 Products: Final products array:', products);
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('🚨 Products: Fetch Error:', error);
    throw error;
  }
};

const fetchCategories = async (): Promise<string[]> => {
  const url = `${API_BASE}/api/products/categories`;
  console.log('🔗 Products: Fetching categories from:', url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // ✅ FIXED: Handle both response formats
    const categories = data.data || data;
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('🚨 Products: Categories Error:', error);
    // ✅ FIXED: Return default categories if API fails
    return ['T-Shirts', 'Phone Covers', 'Hoodies', 'Bottles', 'Plates'];
  }
};

// Add this after your imports and interfaces, before ProductDetailPage
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
  const [imageSrc, setImageSrc] = useState(resolveImageUrl(src));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageSrc(resolveImageUrl(src));
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    console.log('❌ Image failed to load:', imageSrc);
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', imageSrc);
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

// Size Chart Modal Component
const SizeChartModal = ({
  isOpen,
  onClose,
  category
}: {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}) => {
  if (!isOpen || !SIZE_CHART[category as keyof typeof SIZE_CHART]) return null;

  const sizeData = SIZE_CHART[category as keyof typeof SIZE_CHART];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Ruler className="w-6 h-6 mr-2 text-blue-600" />
            Size Chart - {category}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Size Chart Content */}
        <div className="p-6">
          {/* Measurement Guide */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              How to Measure
            </h3>
            <div className="text-blue-800 text-sm space-y-1">
              <p><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
              <p><strong>Length:</strong> Measure from the highest point of the shoulder to the bottom hem.</p>
              <p><strong>Shoulder:</strong> Measure from one shoulder point to the other across the back.</p>
            </div>
          </div>

          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Size</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Chest (inches)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Length (inches)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Shoulder (inches)</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.sizes.map((size) => (
                  <tr key={size} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium">{size}</td>
                    <td className="border border-gray-300 px-4 py-3">{sizeData.measurements[size].chest}</td>
                    <td className="border border-gray-300 px-4 py-3">{sizeData.measurements[size].length}</td>
                    <td className="border border-gray-300 px-4 py-3">{sizeData.measurements[size].shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Size Guide Tips */}
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">👕 Size Guide Tips</h4>
            <ul className="text-yellow-800 text-sm space-y-1 list-disc list-inside">
              <li>All measurements are in inches and represent garment measurements</li>
              <li>For a relaxed fit, choose one size larger than your body measurement</li>
              <li>If you're between sizes, we recommend going with the larger size</li>
              <li>Our products are pre-shrunk, but may shrink slightly after washing</li>
              <li>Contact us if you need help choosing the right size!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Size Selection Component
const SizeSelector = ({
  category,
  selectedSize,
  onSizeSelect,
  onShowSizeChart
}: {
  category: string;
  selectedSize?: string;
  onSizeSelect: (size: string) => void;
  onShowSizeChart: () => void;
}) => {
  const sizeData = SIZE_CHART[category as keyof typeof SIZE_CHART];

  if (!sizeData) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Select Size:</h4>
        <button
          onClick={onShowSizeChart}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          <Ruler className="w-4 h-4" />
          Size Chart
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {sizeData.sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeSelect(size)}
            className={`p-3 border-2 rounded-lg font-medium transition-all transform hover:scale-105 ${selectedSize === size
              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
          >
            {size}
          </button>
        ))}
      </div>

      {selectedSize && (
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-green-800 text-sm">
            ✅ Size <strong>{selectedSize}</strong> selected
            <span className="block text-xs mt-1">
              Chest: {sizeData.measurements[selectedSize].chest}" | Length: {sizeData.measurements[selectedSize].length}"
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

// Product Detail Page Component - UPDATED with size selection
const ProductDetailPage = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  favorites,
  toggleFavorite,
  relatedProducts,
  openProductDetail
}: {
  product: Product;
  onBack: () => void;
  onAddToCart: (id: number, size?: string) => void;
  onBuyNow: (id: number, size?: string) => void;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
  relatedProducts: Product[];
  openProductDetail: (product: Product) => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Check if this product requires size selection
  const requiresSize = SIZE_CHART[product.category as keyof typeof SIZE_CHART];

  // Get product images without pre-resolving URLs (let RobustImage handle it)
  let productImages = [];

  if (product.images) {
    try {
      const parsedImages = typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images;
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        productImages = parsedImages; // Don't resolve here, let RobustImage handle it
      } else {
        productImages = [product.imageUrl];
      }
    } catch (e) {
      productImages = [product.imageUrl];
    }
  } else {
    productImages = [product.imageUrl];
  }

  console.log('🖼️ Product images for detail page:', productImages);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Parse tags safely
  let tags: string[] = [];
  if (product.tags) {
    try {
      tags = JSON.parse(product.tags);
    } catch (e) {
      tags = [product.tags];
    }
  }

  const isFavorite = favorites.has(product.id);

  // Use same consistent calculation as ProductCard
  const price = parseFloat(product.price);
  const productSeed = product.id || 1;
  const discountPercent = 10 + (productSeed % 21);
  const originalPrice = (price / (1 - discountPercent / 100)).toFixed(2);

  // Generate consistent rating based on product ID
  const rating = (4.0 + (productSeed % 15) / 10).toFixed(1);
  const reviewCount = 100 + (productSeed * 7) % 900;

  // Handle add to cart with size validation
  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      onAddToCart(product.id, selectedSize);
    }
  };

  // Handle buy now with size validation
  const handleBuyNow = () => {
    if (requiresSize && !selectedSize) {
      alert('Please select a size before purchasing');
      return;
    }

    onBuyNow(product.id, selectedSize);
  };

  // Related Products Component
  const RelatedProductCard = ({ relatedProduct }: { relatedProduct: Product }) => {
    const relatedPrice = parseFloat(relatedProduct.price);
    const relatedSeed = relatedProduct.id || 1;
    const relatedDiscount = 10 + (relatedSeed % 21);
    const relatedOriginal = (relatedPrice / (1 - relatedDiscount / 100)).toFixed(2);

    return (
      <div
        onClick={() => openProductDetail(relatedProduct)}
        className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer overflow-hidden border border-gray-100"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={resolveImageUrl(relatedProduct.imageUrl)}
            alt={relatedProduct.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=300&fit=crop";
            }}
          />
          {relatedProduct.featured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ⭐ BESTSELLER
            </div>
          )}
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {relatedDiscount}% OFF
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
            {relatedProduct.category}
          </div>

          <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {relatedProduct.name}
          </h4>

          <div className="flex items-center mb-2">
            <span className="text-lg font-bold text-gray-900">₹{relatedProduct.price}</span>
            <span className="text-sm text-gray-400 line-through ml-2">₹{relatedOriginal}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '4rem' }}>
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Main Product Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative group">
                <RobustImage
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-[500px] object-cover rounded-xl"
                />

                {/* Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      BESTSELLER
                    </div>
                  )}
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {discountPercent}% OFF
                  </div>
                </div>
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Category */}
              <div className="text-sm text-blue-600 font-semibold uppercase tracking-wide">
                {product.category}
              </div>

              {/* Title & Actions */}
              <div className="flex items-start justify-between">
                <h1 className="text-4xl font-bold text-gray-900 pr-4">{product.name}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                    <Share2 className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg">
                  <span className="font-bold text-lg">{rating}</span>
                  <Star className="w-5 h-5 ml-1 fill-current" />
                </div>
                <span className="text-gray-600 text-lg">({reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-bold text-gray-900">₹{product.price}</span>
                  <span className="text-3xl text-gray-400 line-through">₹{originalPrice}</span>
                </div>
                <div className="text-green-600 text-xl font-semibold">
                  You save ₹{(parseFloat(originalPrice) - parseFloat(product.price)).toFixed(2)}
                  ({discountPercent}% off)
                </div>
              </div>

              {/* Stock Status */}
              <div className={`flex items-center gap-2 ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-4 h-4 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium text-lg">
                  {product.inStock ? 'In Stock - Ready to Ship' : 'Out of Stock'}
                </span>
              </div>

              {/* Size Selection */}
              {requiresSize && product.inStock && (
                <SizeSelector
                  category={product.category}
                  selectedSize={selectedSize}
                  onSizeSelect={setSelectedSize}
                  onShowSizeChart={() => setShowSizeChart(true)}
                />
              )}

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 text-lg font-semibold border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-6 h-6 mr-3" />
                    ADD TO CART
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-6 h-6 mr-3" />
                    BUY NOW
                  </button>
                </div>

                {/* Delivery Info */}
                {product.inStock && (
                  <div className="bg-green-50 p-6 rounded-xl space-y-3">
                    <div className="flex items-center text-green-800">
                      <Truck className="w-6 h-6 mr-3" />
                      <span className="font-medium text-lg">Free delivery by tomorrow</span>
                    </div>
                    <div className="flex items-center text-green-800">
                      <RotateCcw className="w-6 h-6 mr-3" />
                      <span className="font-medium text-lg">Easy 30-day returns</span>
                    </div>
                    <div className="flex items-center text-green-800">
                      <Shield className="w-6 h-6 mr-3" />
                      <span className="font-medium text-lg">2 year warranty included</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Description & Details */}
          <div className="border-t border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Product Description</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm border border-blue-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Features */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Product Features</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    High-quality materials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Authentic anime design
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Comfortable fit
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Machine washable
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Perfect for anime fans
                  </li>
                  {requiresSize && (
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Multiple sizes available
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
              <p className="text-gray-600 text-lg">Check out these similar amazing products</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <RelatedProductCard key={relatedProduct.id} relatedProduct={relatedProduct} />
              ))}
            </div>

            {relatedProducts.length > 4 && (
              <div className="text-center">
                <button
                  onClick={onBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  View All Products
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        category={product.category}
      />
    </div>
  );
};

// Shopping Cart Modal Component - UPDATED to show sizes
const ShoppingCartModal = ({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  onCheckout
}: {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (productId: number, quantity: number, size?: string) => void;
  removeFromCart: (productId: number, size?: string) => void;
  onCheckout: () => void;
}) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">🛒 Shopping Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600">Add some amazing anime products to get started!</p>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={`${item.product.id}-${item.size || 'no-size'}-${index}`} className="flex items-center gap-4 p-4 border rounded-lg">
                    <RobustImage
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.product.category}</p>
                      {item.size && (
                        <p className="text-sm text-blue-600 font-medium">Size: {item.size}</p>
                      )}
                      <p className="text-lg font-bold text-blue-600">₹{item.product.price}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.size)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={onCheckout}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Favorites Modal Component
const FavoritesModal = ({
  isOpen,
  onClose,
  favoriteItems,
  removeFromFavorites,
  addToCart
}: {
  isOpen: boolean;
  onClose: () => void;
  favoriteItems: Product[];
  removeFromFavorites: (productId: number) => void;
  addToCart: (productId: number, size?: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">❤️ Your Favorites</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Favorites Grid */}
        <div className="p-6">
          {favoriteItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600">Start adding products to your wishlist!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteItems.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="relative mb-4">
                    <RobustImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFromFavorites(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <p className="text-lg font-bold text-blue-600 mb-4">₹{product.price}</p>

                  <button
                    onClick={() => addToCart(product.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Checkout Page Component - UPDATED to show sizes in order summary
const CheckoutPage = ({
  cartItems,
  onBack,
  onPaymentSuccess
}: {
  cartItems: CartItem[];
  onBack: () => void;
  onPaymentSuccess: () => void;
}) => {
  const { user } = useAuth(); // Get current user

  // Helper function to get user's full name
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
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
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
        // Simulate Razorpay payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('🎉 Payment Successful! Order confirmed.');
      } else {
        // Cash on Delivery
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('📦 Order placed! Pay on delivery.');
      }

      // Save purchase to localStorage with size information
      const purchase = {
        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user?.id || 'guest',
        userEmail: user?.email || userDetails.email,
        userName: user?.name || userDetails.name,
        items: cartItems.map(item => ({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId: item.product.id.toString(),
          productName: item.product.name,
          price: parseFloat(item.product.price),
          quantity: item.quantity,
          size: item.size || null // Include size in purchase record
        })),
        totalAmount: totalAmount,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      const existingPurchases = JSON.parse(localStorage.getItem('all_purchases') || '[]');
      existingPurchases.push(purchase);
      localStorage.setItem('all_purchases', JSON.stringify(existingPurchases));

      console.log('✅ Purchase saved to localStorage:', purchase);

      onPaymentSuccess();
    } catch (error) {
      alert('❌ Payment failed. Please try again.');
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
                <div key={`${item.product.id}-${item.size || 'no-size'}-${index}`} className="flex items-center gap-4">
                  <RobustImage
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.size && (
                      <p className="text-sm text-blue-600 font-medium">Size: {item.size}</p>
                    )}
                  </div>
                  <p className="font-bold">₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
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

export default function ProductsPage() {
  const { user } = useAuth(); // Add this line to get current user
  const actualUser = localStorage.getItem('current_user');
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState("newest");

  // Page Navigation State
  const [currentView, setCurrentView] = useState<'products' | 'product-detail'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Shopping System State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // ✅ NEW: Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<'login' | 'checkout'>('login');

  // URL params handling for category filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, []);

  // ✅ FIXED: Use consistent query key with admin page
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts({
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      featured: showFeaturedOnly
    }),
    retry: 3,
    retryDelay: 1000,
  });

  // ✅ FIXED: Use consistent query key for categories
  const { data: apiCategories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    retry: 3,
    retryDelay: 1000,
  });

  // Categories including "All"
  const categories = ["All", ...apiCategories];

  // Toggle favorite
  const toggleFavorite = (productId: number) => {
    console.log('💖 toggleFavorite called for product:', productId);
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        setFavoriteItems(prev => prev.filter(item => item.id !== productId));
        console.log('💔 Removed from favorites:', productId);
      } else {
        newFavorites.add(productId);
        const product = products.find(p => p.id === productId);
        if (product) {
          setFavoriteItems(prev => [...prev, product]);
          console.log('💝 Added to favorites:', productId);
        }
      }
      return newFavorites;
    });
  };

  // Add to cart - UPDATED to handle sizes
  const addToCart = (productId: number, size?: string) => {
    console.log('🛒 addToCart called for product:', productId, 'size:', size);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if product requires size selection
    const requiresSize = SIZE_CHART[product.category as keyof typeof SIZE_CHART];
    if (requiresSize && !size) {
      alert('Please select a size before adding to cart');
      return;
    }

    setCartItems(prev => {
      // For products with sizes, create separate cart items for each size
      const existingItem = prev.find(item =>
        item.product.id === productId &&
        (size ? item.size === size : !item.size)
      );

      if (existingItem) {
        return prev.map(item =>
          item.product.id === productId &&
            (size ? item.size === size : !item.size)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, size }];
    });

    setCart(prev => new Set(prev).add(productId));
    console.log(`✅ Added ${product.name}${size ? ` (Size: ${size})` : ''} to cart!`);
  };

  // Update quantity in cart - UPDATED to handle sizes
  const updateQuantity = (productId: number, quantity: number, size?: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId &&
          (size ? item.size === size : !item.size)
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Remove from cart - UPDATED to handle sizes
  const removeFromCart = (productId: number, size?: string) => {
    setCartItems(prev => prev.filter(item =>
      !(item.product.id === productId &&
        (size ? item.size === size : !item.size))
    ));

    // If no items left for this product, remove from cart set
    const remainingItems = cartItems.filter(item =>
      item.product.id === productId &&
      !(size ? item.size === size : !item.size)
    );

    if (remainingItems.length === 0) {
      setCart(prev => {
        const newCart = new Set(prev);
        newCart.delete(productId);
        return newCart;
      });
    }
  };

  // ✅ FIXED: Buy now function with authentication check and size handling
  const buyNow = (productId: number, size?: string) => {
    console.log('⚡ buyNow called for product:', productId, 'size:', size);

    // Check if user is logged in
    if (!user) {
      console.log('❌ User not logged in, showing auth modal');
      setAuthAction('checkout');
      setShowAuthModal(true);
      // Add to cart so when they login, they can proceed
      addToCart(productId, size);
      return;
    }

    // User is logged in, proceed with purchase
    addToCart(productId, size);
    setShowCheckout(true);
    console.log(`🚀 Proceeding to checkout for product ${productId}${size ? ` (Size: ${size})` : ''}!`);
  };

  // ✅ FIXED: Handle checkout with authentication check
  const handleCheckout = () => {
    console.log('🛒 handleCheckout called');

    // Check if user is logged in
    if (!user) {
      console.log('❌ User not logged in, showing auth modal');
      setAuthAction('checkout');
      setShowAuthModal(true);
      return;
    }

    // User is logged in, proceed to checkout
    setShowCart(false);
    setShowCheckout(true);
    console.log('🚀 Proceeding to checkout!');
  };

  // ✅ NEW: Handle successful authentication
  const handleAuthSuccess = () => {
    console.log('✅ Authentication successful');
    setShowAuthModal(false);

    // If they were trying to checkout, proceed to checkout
    if (authAction === 'checkout') {
      setShowCheckout(true);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    setCartItems([]);
    setCart(new Set());
    setShowCheckout(false);
    
    const response = await axios.post(`${API_BASE}/api/mail`, { actualUser });
    if (response.data.success) {
      alert('🎉 Order placed successfully! Check your email for confirmation.');
    } else {
      alert('Email not sent.');

    }
  };

  // Open product detail page
  const openProductDetail = (product: Product) => {
    console.log('👁️ Opening product detail page for:', product.id);
    setSelectedProduct(product);
    setCurrentView('product-detail');
    // Scroll to top when opening product detail
    window.scrollTo(0, 0);
  };

  // Go back to products list
  const goBackToProducts = () => {
    setCurrentView('products');
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  // Get related products (same category, excluding current product)
  const getRelatedProducts = (currentProduct: Product): Product[] => {
    return products
      .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
      .slice(0, 8); // Get up to 8 related products
  };

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      // ✅ FIXED: Filter by category if selected
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      // ✅ FIXED: Filter by featured if enabled
      const matchesFeatured = !showFeaturedOnly || product.featured;

      if (!searchQuery) return matchesCategory && matchesFeatured;

      const searchLower = searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(searchLower);
      const matchesDescription = product.description.toLowerCase().includes(searchLower);

      let matchesTags = false;
      if (product.tags) {
        try {
          const tags = JSON.parse(product.tags);
          matchesTags = Array.isArray(tags) && tags.some(tag =>
            tag.toLowerCase().includes(searchLower)
          );
        } catch (e) {
          matchesTags = product.tags.toLowerCase().includes(searchLower);
        }
      }

      return matchesCategory && matchesFeatured && (matchesName || matchesDescription || matchesTags);
    });

    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [products, searchQuery, sortBy, selectedCategory, showFeaturedOnly]);

  // Error component with debugging info
  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ paddingTop: '5rem' }}>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-red-600">Connection Error</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">Cannot connect to the API server.</p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Current URL:</strong> {window.location.href}</p>
                <p><strong>API Base:</strong> {API_BASE || 'Same origin'}</p>
                <p><strong>Port:</strong> {window.location.port || 'Default'}</p>
                <p><strong>Error:</strong> {productsError.message}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">Solutions:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Make sure your backend is running: <code className="bg-blue-100 px-1 rounded">npx tsx server/index.ts</code></li>
                <li>Visit the correct URL: <strong>http://localhost:5000/products</strong> (not 5173)</li>
                <li>Test API directly: <a href="http://localhost:5000/api/products" target="_blank" className="underline">http://localhost:5000/api/products</a></li>
                <li>Check browser console (F12) for more errors</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = 'http://localhost:5000/products'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-1"
              >
                Go to Correct URL
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ UPDATED: ProductCard Component with authentication check and size awareness
  const ProductCard = ({ product, isListView = false }: { product: Product; isListView?: boolean }) => {
    let tags: string[] = [];
    if (product.tags) {
      try {
        tags = JSON.parse(product.tags);
      } catch (e) {
        tags = [product.tags];
      }
    }

    // Get display image without pre-resolving (let RobustImage handle it)
    let displayImage = product.imageUrl;
    if (product.images) {
      try {
        const parsedImages = typeof product.images === 'string'
          ? JSON.parse(product.images)
          : product.images;
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          displayImage = parsedImages[0];
        }
      } catch (e) {
        console.warn('Error parsing product images:', e);
      }
    }

    const isFavorite = favorites.has(product.id);
    const isInCart = cart.has(product.id);
    const requiresSize = SIZE_CHART[product.category as keyof typeof SIZE_CHART];

    const price = parseFloat(product.price);
    const productSeed = product.id || 1;
    const discountPercent = 10 + (productSeed % 21);
    const originalPrice = (price / (1 - discountPercent / 100)).toFixed(2);
    const rating = (4.0 + (productSeed % 15) / 10).toFixed(1);
    const reviewCount = 100 + (productSeed * 7) % 900;

    const handleAddToCart = () => {
      if (requiresSize) {
        // If requires size, open product detail to select size
        openProductDetail(product);
      } else {
        addToCart(product.id);
      }
    };

    const handleBuyNow = () => {
      if (requiresSize) {
        // If requires size, open product detail to select size
        openProductDetail(product);
      } else {
        buyNow(product.id);
      }
    };

    return (
      <div className={`group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden border border-gray-100 ${isListView ? 'flex' : ''} relative cursor-pointer`}>
        {/* Product Image - CLICKABLE */}
        <div
          className={`relative overflow-hidden ${isListView ? 'w-48 flex-shrink-0' : 'h-56'}`}
          onClick={() => openProductDetail(product)}
        >
          <RobustImage
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
          />

          {/* Animated Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges with Animation */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300">
            {product.featured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                <Star className="w-3 h-3 mr-1 fill-current" />
                BESTSELLER
              </div>
            )}
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
              {discountPercent}% OFF
            </div>
            {requiresSize && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                <Ruler className="w-3 h-3 mr-1" />
                SIZES
              </div>
            )}
          </div>

          {/* Heart Icon with Animation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('💖 Favorite button clicked for product:', product.id);
              toggleFavorite(product.id);
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-125 z-10 opacity-90 group-hover:opacity-100"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-400'} transition-colors`} />
          </button>

          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">OUT OF STOCK</span>
            </div>
          )}

          {/* Hover Info */}
          <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
              <span className="text-sm font-medium text-gray-800">
                {requiresSize ? 'Click to select size' : 'Click to view details'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className={`p-4 ${isListView ? 'flex-1' : ''} relative`}>
          {/* Category */}
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
            {product.category}
            {requiresSize && <span className="text-blue-600 ml-2">• Multiple Sizes</span>}
          </div>

          {/* Product Name - CLICKABLE */}
          <h3
            className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => openProductDetail(product)}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded text-xs">
              <span className="font-bold">{rating}</span>
              <Star className="w-3 h-3 ml-1 fill-current" />
            </div>
            <span className="text-gray-500 text-xs ml-2">({reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center mb-3">
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            <span className="text-lg text-gray-400 line-through ml-2">₹{originalPrice}</span>
            <span className="text-green-600 text-sm font-semibold ml-2">
              {discountPercent}% off
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('🛒 Add to cart clicked for product:', product.id);
                handleAddToCart();
              }}
              disabled={!product.inStock}
              className={`flex-1 ${isInCart
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                } px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm`}
            >
              {isInCart ? (
                <>
                  <ShoppingBag className="w-4 h-4 mr-1" />
                  ADDED
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {requiresSize ? 'SELECT SIZE' : 'ADD TO CART'}
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('⚡ Buy now clicked for product:', product.id);
                handleBuyNow();
              }}
              disabled={!product.inStock}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
            >
              <Zap className="w-4 h-4 mr-1" />
              {requiresSize ? 'QUICK BUY' : 'BUY NOW'}
            </button>
          </div>

          {/* Delivery Info */}
          {product.inStock && (
            <div className="mt-3 flex items-center text-xs text-gray-600">
              <Truck className="w-3 h-3 mr-1" />
              <span>Free delivery by tomorrow</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show Product Detail Page if a product is selected
  if (currentView === 'product-detail' && selectedProduct) {
    const relatedProducts = getRelatedProducts(selectedProduct);

    return (
      <>
        <ProductDetailPage
          product={selectedProduct}
          onBack={goBackToProducts}
          onAddToCart={addToCart}
          onBuyNow={buyNow}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          relatedProducts={relatedProducts}
          openProductDetail={openProductDetail}
        />

        {/* Modals */}
        <ShoppingCartModal
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          onCheckout={handleCheckout}
        />

        <FavoritesModal
          isOpen={showFavorites}
          onClose={() => setShowFavorites(false)}
          favoriteItems={favoriteItems}
          removeFromFavorites={toggleFavorite}
          addToCart={addToCart}
        />

        {/* ✅ NEW: Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          defaultMode="login"
        />

        {showCheckout && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <CheckoutPage
              cartItems={cartItems}
              onBack={() => {
                setShowCheckout(false);
                setShowCart(true);
              }}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        )}
      </>
    );
  }

  // Show Products List (Default View)
  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '4rem' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <h1 className="text-4xl font-bold">🎌 Our Amazing Products</h1>

              {/* Cart and Favorites Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCart(true)}
                  className="relative p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all transform hover:scale-110"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowFavorites(true)}
                  className="relative p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all transform hover:scale-110"
                >
                  <Heart className="w-6 h-6" />
                  {favoriteItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {favoriteItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Discover incredible anime-themed products from T-shirts to accessories - bring your favorite anime to life! ✨
            </p>
            <div className="flex justify-center gap-8 mt-6 text-sm">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                100% Authentic
              </div>
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Free Shipping
              </div>
              <div className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-2" />
                Easy Returns
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for anime products..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {category === 'T-Shirts' && '👕 '}
                  {category === 'Phone Covers' && '📱 '}
                  {category === 'Hoodies' && '🧥 '}
                  {category === 'Bottles' && '🍼 '}
                  {category === 'Plates' && '🍽️ '}
                  {category === 'All' && '🛍️ '}
                  {category}
                </button>
              ))}
            </div>

            {/* View Options */}
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">⭐ Featured Only</span>
              </label>

              <div className="flex border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-all ${viewMode === "grid" ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-all ${viewMode === "list" ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {productsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <span className="text-xl text-gray-600">Loading awesome anime products...</span>
            </div>
          </div>
        )}

        {/* Products Count & Cart Info */}
        {!productsLoading && products.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              <span className="font-semibold">{filteredAndSortedProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
              {selectedCategory !== "All" && ` in "${selectedCategory}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>

            {cart.size > 0 && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium animate-pulse">
                🛒 {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in cart | ❤️ {favoriteItems.length} favorites
              </div>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {!productsLoading && (
          <>
            {filteredAndSortedProducts.length > 0 ? (
              <div className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isListView={viewMode === "list"}
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No anime products found</h3>
                <p className="text-gray-600">
                  Try different search terms or browse different categories
                </p>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="text-gray-400 mb-4">
                  <AlertCircle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600">
                  The product catalog is empty. Check if your backend is properly initialized.
                </p>
              </div>
            )}
          </>
        )}

        {/* Size Chart Help */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center justify-center">
              <Ruler className="w-6 h-6 mr-2" />
              Need Help with Sizing?
            </h3>
            <p className="text-blue-800 mb-4">
              We offer detailed size charts for all our clothing items to ensure the perfect fit!
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">👕 T-Shirts & Tops</h4>
                <p>Available in XS to XXL with detailed chest, length, and shoulder measurements</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🧥 Hoodies & Sweatshirts</h4>
                <p>Comfortable fits with size guide for perfect anime-style fashion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShoppingCartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
      />

      <FavoritesModal
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        favoriteItems={favoriteItems}
        removeFromFavorites={toggleFavorite}
        addToCart={addToCart}
      />

      {/* ✅ NEW: Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        defaultMode="login"
      />

      {showCheckout && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <CheckoutPage
            cartItems={cartItems}
            onBack={() => {
              setShowCheckout(false);
              setShowCart(true);
            }}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      )}
    </div>
  );
}