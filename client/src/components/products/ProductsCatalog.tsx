// // ============================================================================
// // 1. UPDATED ProductsCatalog.tsx
// // ============================================================================

// import React, { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import BuyButton from '../common/BuyButton';
// import { Search, Filter, Star, ShoppingCart, Eye, Grid, List, Loader2, Heart, ShoppingBag, Truck, Shield, RotateCcw, AlertCircle } from 'lucide-react';

// // Types for your API
// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: string;
//   imageUrl: string;
//   category: string;
//   inStock: boolean;
//   featured: boolean;
//   tags?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // API Base URL - Try both ports
// const API_BASE = window.location.port === '5000' ? '' : 'http://localhost:5000';

// // API functions with better error handling
// const fetchProducts = async (filters?: { category?: string; featured?: boolean; inStock?: boolean }): Promise<Product[]> => {
//   const params = new URLSearchParams();
//   if (filters?.category) params.append('category', filters.category);
//   if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
//   if (filters?.inStock !== undefined) params.append('inStock', filters.inStock.toString());
  
//   const url = `${API_BASE}/api/products${params.toString() ? `?${params.toString()}` : ''}`;
//   console.log('🔗 Fetching from:', url);
  
//   try {
//     const response = await fetch(url);
//     console.log('📡 Response status:', response.status);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ API Error Response:', errorText);
//       throw new Error(`HTTP ${response.status}: ${errorText}`);
//     }
    
//     const data = await response.json();
//     console.log('✅ API Response:', data);
//     return data.data || data;
//   } catch (error) {
//     console.error('🚨 Fetch Error:', error);
//     throw error;
//   }
// };

// const fetchCategories = async (): Promise<string[]> => {
//   const url = `${API_BASE}/api/products/categories`;
//   console.log('🔗 Fetching categories from:', url);
  
//   try {
//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`HTTP ${response.status}`);
//     const data = await response.json();
//     return data.data || data;
//   } catch (error) {
//     console.error('🚨 Categories Error:', error);
//     throw error;
//   }
// };

// export default function ProductsPage() {
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewMode, setViewMode] = useState("grid");
//   const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
//   const [favorites, setFavorites] = useState<Set<number>>(new Set());
//   const [cart, setCart] = useState<Set<number>>(new Set());
//   const [sortBy, setSortBy] = useState("newest");

//   // Debug info
//   const [debugInfo, setDebugInfo] = useState({
//     currentUrl: window.location.href,
//     apiBase: API_BASE,
//     port: window.location.port
//   });

//   // Fetch products using React Query
//   const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
//     queryKey: ['products', { category: selectedCategory !== "All" ? selectedCategory : undefined, featured: showFeaturedOnly }],
//     queryFn: () => fetchProducts({ 
//       category: selectedCategory !== "All" ? selectedCategory : undefined, 
//       featured: showFeaturedOnly 
//     }),
//     retry: 3,
//     retryDelay: 1000,
//   });

//   // Fetch categories using React Query
//   const { data: apiCategories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
//     queryKey: ['categories'],
//     queryFn: fetchCategories,
//     retry: 3,
//     retryDelay: 1000,
//   });

//   // Categories including "All"
//   const categories = ["All", ...apiCategories];

//   // Toggle favorite
//   const toggleFavorite = (productId: number) => {
//     setFavorites(prev => {
//       const newFavorites = new Set(prev);
//       if (newFavorites.has(productId)) {
//         newFavorites.delete(productId);
//       } else {
//         newFavorites.add(productId);
//       }
//       return newFavorites;
//     });
//   };

//   // Add to cart
//   const addToCart = (productId: number) => {
//     setCart(prev => {
//       const newCart = new Set(prev);
//       newCart.add(productId);
//       return newCart;
//     });
//     console.log(`Added product ${productId} to cart!`);
//   };

//   // Filter and sort products
//   const filteredAndSortedProducts = React.useMemo(() => {
//     let filtered = products.filter(product => {
//       if (!searchQuery) return true;
      
//       const searchLower = searchQuery.toLowerCase();
//       const matchesName = product.name.toLowerCase().includes(searchLower);
//       const matchesDescription = product.description.toLowerCase().includes(searchLower);
      
//       // Parse tags if they exist
//       let matchesTags = false;
//       if (product.tags) {
//         try {
//           const tags = JSON.parse(product.tags);
//           matchesTags = Array.isArray(tags) && tags.some(tag => 
//             tag.toLowerCase().includes(searchLower)
//           );
//         } catch (e) {
//           matchesTags = product.tags.toLowerCase().includes(searchLower);
//         }
//       }
      
//       return matchesName || matchesDescription || matchesTags;
//     });

//     // Sort products
//     switch (sortBy) {
//       case 'price-low':
//         return filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//       case 'price-high':
//         return filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//       case 'name':
//         return filtered.sort((a, b) => a.name.localeCompare(b.name));
//       case 'newest':
//       default:
//         return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//     }
//   }, [products, searchQuery, sortBy]);

//   // Error component with debugging info
//   if (productsError) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
//           <div className="flex items-center mb-4">
//             <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
//             <h2 className="text-2xl font-bold text-red-600">Connection Error</h2>
//           </div>
          
//           <div className="space-y-4">
//             <p className="text-gray-700">Cannot connect to the API server.</p>
            
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-semibold mb-2">Debug Information:</h3>
//               <div className="text-sm space-y-1">
//                 <p><strong>Current URL:</strong> {debugInfo.currentUrl}</p>
//                 <p><strong>API Base:</strong> {debugInfo.apiBase || 'Same origin'}</p>
//                 <p><strong>Port:</strong> {debugInfo.port || 'Default'}</p>
//                 <p><strong>Error:</strong> {productsError.message}</p>
//               </div>
//             </div>
            
//             <div className="bg-blue-50 p-4 rounded-lg">
//               <h3 className="font-semibold mb-2 text-blue-800">Solutions:</h3>
//               <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
//                 <li>Make sure your backend is running: <code className="bg-blue-100 px-1 rounded">npx tsx server/index.ts</code></li>
//                 <li>Visit the correct URL: <strong>http://localhost:5000/products</strong> (not 5173)</li>
//                 <li>Test API directly: <a href="http://localhost:5000/api/products" target="_blank" className="underline">http://localhost:5000/api/products</a></li>
//                 <li>Check browser console (F12) for more errors</li>
//               </ol>
//             </div>
            
//             <div className="flex gap-3">
//               <button 
//                 onClick={() => window.location.href = 'http://localhost:5000/products'} 
//                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-1"
//               >
//                 Go to Correct URL
//               </button>
//               <button 
//                 onClick={() => window.location.reload()} 
//                 className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const ProductCard = ({ product, isListView = false }: { product: Product; isListView?: boolean }) => {
//     // Parse tags safely
//     let tags: string[] = [];
//     if (product.tags) {
//       try {
//         tags = JSON.parse(product.tags);
//       } catch (e) {
//         tags = [product.tags];
//       }
//     }

//     const isFavorite = favorites.has(product.id);
//     const originalPrice = (parseFloat(product.price) * 1.3).toFixed(2);

//     return (
//       <div className={`group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 ${isListView ? 'flex' : ''} relative`}>
//         {/* Product Image */}
//         <div className={`relative overflow-hidden ${isListView ? 'w-48 flex-shrink-0' : 'h-56'}`}>
//           <img 
//             src={product.imageUrl} 
//             alt={product.name}
//             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//             onError={(e) => {
//               (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=300&fit=crop";
//             }}
//           />
          
//           {/* Badges */}
//           <div className="absolute top-2 left-2 flex flex-col gap-1">
//             {product.featured && (
//               <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
//                 <Star className="w-3 h-3 mr-1 fill-current" />
//                 BESTSELLER
//               </div>
//             )}
//             <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
//               {Math.floor(Math.random() * 30 + 10)}% OFF
//             </div>
//           </div>

//           {/* Heart Icon */}
//           <button 
//             onClick={() => toggleFavorite(product.id)}
//             className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
//           >
//             <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} transition-colors`} />
//           </button>

//           {!product.inStock && (
//             <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
//               <span className="text-white font-bold text-lg">OUT OF STOCK</span>
//             </div>
//           )}

//           {/* Quick View on Hover */}
//           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
//             <button className="opacity-0 group-hover:opacity-100 bg-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
//               <Eye className="w-5 h-5 text-gray-700" />
//             </button>
//           </div>
//         </div>

//         {/* Product Info */}
//         <div className={`p-4 ${isListView ? 'flex-1' : ''} relative`}>
//           {/* Brand/Category */}
//           <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
//             {product.category}
//           </div>
          
//           {/* Product Name */}
//           <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
//             {product.name}
//           </h3>
          
//           {/* Rating */}
//           <div className="flex items-center mb-2">
//             <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded text-xs">
//               <span className="font-bold">{(4.0 + Math.random()).toFixed(1)}</span>
//               <Star className="w-3 h-3 ml-1 fill-current" />
//             </div>
//             <span className="text-gray-500 text-xs ml-2">({Math.floor(Math.random() * 1000 + 100)} reviews)</span>
//           </div>

//           {/* Price */}
//           <div className="flex items-center mb-3">
//             <span className="text-2xl font-bold text-gray-900">${product.price}</span>
//             <span className="text-lg text-gray-400 line-through ml-2">${originalPrice}</span>
//             <span className="text-green-600 text-sm font-semibold ml-2">
//               {Math.floor(((parseFloat(originalPrice) - parseFloat(product.price)) / parseFloat(originalPrice)) * 100)}% off
//             </span>
//           </div>
          
//           <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//             {product.description}
//           </p>
          
//           {/* Tags */}
//           {tags.length > 0 && (
//             <div className="flex flex-wrap gap-1 mb-4">
//               {tags.slice(0, 3).map((tag, index) => (
//                 <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
//                   #{tag}
//                 </span>
//               ))}
//             </div>
//           )}

//           {/* Action Buttons - UPDATED WITH BUY BUTTON */}
//           <div className="flex gap-2">
//             {product.inStock ? (
//               <BuyButton
//                 productData={{
//                   id: product.id.toString(),
//                   name: product.name,
//                   price: parseFloat(product.price),
//                   // Add optional product details
//                   category: product.category,
//                   image: product.imageUrl,
//                 }}
//                 className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center transform hover:scale-105 shadow-lg"
//               >
//                 <ShoppingCart className="w-4 h-4 mr-2" />
//                 BUY NOW - ${product.price}
//               </BuyButton>
//             ) : (
//               <button 
//                 disabled
//                 className="flex-1 bg-gray-400 text-white px-4 py-3 rounded-lg font-bold cursor-not-allowed flex items-center justify-center shadow-lg"
//               >
//                 <ShoppingCart className="w-4 h-4 mr-2" />
//                 OUT OF STOCK
//               </button>
//             )}
//           </div>

//           {/* Delivery Info */}
//           {product.inStock && (
//             <div className="mt-3 flex items-center text-xs text-gray-600">
//               <Truck className="w-3 h-3 mr-1" />
//               <span>Free delivery by tomorrow</span>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header - Matching your existing site */}
//       <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             <h1 className="text-3xl font-bold mb-4">Our Products</h1>
//             <p className="text-lg text-blue-100 max-w-2xl mx-auto">
//               Discover amazing anime-themed products from accessories to collectibles
//             </p>
//             <div className="flex justify-center gap-8 mt-6 text-sm">
//               <div className="flex items-center">
//                 <Shield className="w-4 h-4 mr-2" />
//                 100% Authentic
//               </div>
//               <div className="flex items-center">
//                 <Truck className="w-4 h-4 mr-2" />
//                 Free Shipping
//               </div>
//               <div className="flex items-center">
//                 <RotateCcw className="w-4 h-4 mr-2" />
//                 Easy Returns
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Debug info in development */}
//         {process.env.NODE_ENV === 'development' && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm">
//             <strong>Debug:</strong> Accessing from {debugInfo.currentUrl} → API at {debugInfo.apiBase || 'same origin'}
//           </div>
//         )}

//         {/* Filters and Search - E-commerce Style */}
//         <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
//           <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
//             {/* Search */}
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search products..."
//                 className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             {/* Sort */}
//             <select 
//               value={sortBy} 
//               onChange={(e) => setSortBy(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="newest">Sort: Newest First</option>
//               <option value="price-low">Price: Low to High</option>
//               <option value="price-high">Price: High to Low</option>
//               <option value="name">Name: A to Z</option>
//             </select>

//             {/* Category Filter */}
//             <div className="flex flex-wrap gap-2">
//               {['All', 'T-Shirt', 'Phone Covers', 'Plates', 'Bottles', 'Accessories'].map((category) => (
//                 <button
//                   key={category}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                     selectedCategory === category
//                       ? 'bg-blue-600 text-white shadow-lg transform scale-105'
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                 >
//                   {category}
//                 </button>
//               ))}
//             </div>

//             {/* View Options */}
//             <div className="flex items-center gap-4">
//               <label className="flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={showFeaturedOnly}
//                   onChange={(e) => setShowFeaturedOnly(e.target.checked)}
//                   className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="text-sm text-gray-700 font-medium">⭐ Featured Only</span>
//               </label>
              
//               <div className="flex border-2 border-gray-300 rounded-lg">
//                 <button
//                   onClick={() => setViewMode("grid")}
//                   className={`p-2 ${viewMode === "grid" ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
//                 >
//                   <Grid className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={() => setViewMode("list")}
//                   className={`p-2 ${viewMode === "list" ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
//                 >
//                   <List className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Loading State */}
//         {productsLoading && (
//           <div className="flex items-center justify-center py-12">
//             <div className="text-center">
//               <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
//               <span className="text-xl text-gray-600">Loading awesome anime lifestyle products...</span>
//             </div>
//           </div>
//         )}

//         {/* Products Count & Cart Info */}
//         {!productsLoading && products.length > 0 && (
//           <div className="mb-6 flex justify-between items-center">
//             <p className="text-gray-600">
//               <span className="font-semibold">{filteredAndSortedProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
//               {selectedCategory !== "All" && ` in "${selectedCategory}"`}
//               {searchQuery && ` matching "${searchQuery}"`}
//             </p>
            
//             {cart.size > 0 && (
//               <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
//                 🛒 {cart.size} items in cart | ❤️ {favorites.size} favorites
//               </div>
//             )}
//           </div>
//         )}

//         {/* Products Grid/List */}
//         {!productsLoading && (
//           <>
//             {filteredAndSortedProducts.length > 0 ? (
//               <div className={viewMode === "grid" 
//                 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
//                 : "space-y-4"
//               }>
//                 {filteredAndSortedProducts.map((product) => (
//                   <ProductCard 
//                     key={product.id} 
//                     product={product} 
//                     isListView={viewMode === "list"} 
//                   />
//                 ))}
//               </div>
//             ) : products.length > 0 ? (
//               <div className="text-center py-12 bg-white rounded-lg">
//                 <div className="text-gray-400 mb-4">
//                   <Search className="w-16 h-16 mx-auto" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No anime lifestyle products found</h3>
//                 <p className="text-gray-600">
//                   Try searching for "t-shirt", "phone cover", "plate", "bottle" or browse different categories
//                 </p>
//               </div>
//             ) : (
//               <div className="text-center py-12 bg-white rounded-lg">
//                 <div className="text-gray-400 mb-4">
//                   <AlertCircle className="w-16 h-16 mx-auto" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
//                 <p className="text-gray-600">
//                   The product catalog is empty. Check if your backend is properly initialized.
//                 </p>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }