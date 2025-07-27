import React, { useCallback, useMemo } from 'react';
import { Star, Heart, ShoppingCart, Zap, Ruler } from 'lucide-react';
import PerformanceOptimizedImage from './PerformanceOptimizedImage';

interface Product {
  _id: string;
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  featured: boolean;
  tags?: string;
  images?: string | string[];
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
  isListView?: boolean;
  isFavorite: boolean;
  isInCart: boolean;
  requiresSize: boolean;
  onAddToCart: (productId: string) => void;
  onBuyNow: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
  onOpenDetail: (product: Product) => void;
}

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

const PerformanceOptimizedProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  isListView = false,
  isFavorite,
  isInCart,
  requiresSize,
  onAddToCart,
  onBuyNow,
  onToggleFavorite,
  onOpenDetail
}) => {
  // Memoized calculations
  const { tags, displayImage, price, discountPercent, originalPrice, rating, reviewCount } = useMemo(() => {
    let tags: string[] = [];
    if (product.tags) {
      try {
        tags = JSON.parse(product.tags);
      } catch (e) {
        tags = [product.tags];
      }
    }

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

    const price = parseFloat(product.price);
    const productSeed = product.id || 1;
    const discountPercent = 10 + (productSeed % 21);
    const originalPrice = (price * (1 + discountPercent / 100)).toFixed(2);
    const rating = (4.0 + (productSeed % 15) / 10).toFixed(1);
    const reviewCount = 100 + (productSeed * 7) % 900;

    return { tags, displayImage, price, discountPercent, originalPrice, rating, reviewCount };
  }, [product]);

  // Memoized event handlers
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (requiresSize) {
      onOpenDetail(product);
    } else {
      onAddToCart(product._id);
    }
  }, [requiresSize, product, onAddToCart, onOpenDetail]);

  const handleBuyNow = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (requiresSize) {
      onOpenDetail(product);
    } else {
      onBuyNow(product._id);
    }
  }, [requiresSize, product, onBuyNow, onOpenDetail]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product._id);
  }, [product._id, onToggleFavorite]);

  const handleImageClick = useCallback(() => {
    onOpenDetail(product);
  }, [product, onOpenDetail]);

  return (
    <div className={`group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden border border-gray-100 ${isListView ? 'flex' : ''} relative cursor-pointer`}>
      {/* Product Image - CLICKABLE */}
      <div
        className={`relative overflow-hidden ${isListView ? 'w-48 flex-shrink-0' : 'h-56'}`}
        onClick={handleImageClick}
      >
        <PerformanceOptimizedImage
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
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110 group-hover:opacity-100 opacity-0"
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
          />
        </button>
      </div>

      {/* Product Info */}
      <div className={`p-4 ${isListView ? 'flex-1' : ''}`}>
        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">₹{price}</span>
          <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
            {discountPercent}% OFF
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700 ml-1">{rating}</span>
          </div>
          <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`flex-1 ${isInCart
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              } px-2 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xs`}
          >
            {isInCart ? (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                ADDED
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                {requiresSize ? 'SIZE' : 'ADD TO CART'}
              </>
            )}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-2 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xs"
          >
            <Zap className="w-3 h-3 mr-1" />
            {requiresSize ? 'BUY' : 'BUY'}
          </button>
        </div>
      </div>
    </div>
  );
});

PerformanceOptimizedProductCard.displayName = 'PerformanceOptimizedProductCard';

export default PerformanceOptimizedProductCard; 