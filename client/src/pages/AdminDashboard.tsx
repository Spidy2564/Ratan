// // ============================================================================
// // File: client/src/pages/AdminDashboard.tsx - COMPLETE FIXED VERSION
// // ============================================================================

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { 
//   ShoppingCart, 
//   Package, 
//   Shield, 
//   User, 
//   LogOut, 
//   Eye, 
//   EyeOff, 
//   Bell, 
//   BarChart3,
//   Plus,
//   Edit2,
//   Trash2,
//   Save,
//   X,
//   Search,
//   Filter,
//   Loader2,
//   CheckCircle,
//   AlertCircle
// } from 'lucide-react';

// // ============================================================================
// // INTERFACES
// // ============================================================================

// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   category: string;
//   sizes: string[];
//   colors: string[];
//   imageUrl: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Purchase {
//   id: string;
//   userId: string;
//   items: any[];
//   totalAmount: number;
//   status: string;
//   createdAt: string;
//   userEmail?: string;
//   userName?: string;
// }

// interface Notification {
//   id: string;
//   type: 'order' | 'alert' | 'info';
//   title: string;
//   message: string;
//   timestamp: string;
//   read: boolean;
//   priority: 'low' | 'medium' | 'high' | 'critical';
//   order?: any;
// }

// // ============================================================================
// // PRODUCT MANAGEMENT COMPONENT
// // ============================================================================

// const ProductManagement: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isAddingProduct, setIsAddingProduct] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');
//   const [loading, setLoading] = useState(true);

//   // Form state for new/edit product
//   const [formData, setFormData] = useState<Partial<Product>>({
//     name: '',
//     description: '',
//     price: 0,
//     category: '',
//     sizes: [],
//     colors: [],
//     imageUrl: '',
//     isActive: true
//   });

//   const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
//   const commonColors = ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Purple'];
//   const categories = ['T-Shirts', 'Hoodies', 'Phone Covers', 'Bottles', 'Plates', 'Accessories'];

//   useEffect(() => {
//     loadProducts();
//   }, []);

//   const loadProducts = async () => {
//     try {
//       setLoading(true);
//       // Try to load from API first, fallback to localStorage
//       const savedProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
//       setProducts(savedProducts);
//       console.log('📦 Loaded products:', savedProducts.length);
//     } catch (error) {
//       console.error('❌ Error loading products:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveProducts = (updatedProducts: Product[]) => {
//     try {
//       localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
//       setProducts(updatedProducts);
//       console.log('💾 Products saved successfully');
//     } catch (error) {
//       console.error('❌ Error saving products:', error);
//       alert('Failed to save products');
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.name || !formData.price || !formData.category) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     const now = new Date().toISOString();
    
//     try {
//       if (editingProduct) {
//         // Update existing product
//         const updatedProducts = products.map(product =>
//           product.id === editingProduct
//             ? { ...product, ...formData, updatedAt: now }
//             : product
//         );
//         saveProducts(updatedProducts);
//         setEditingProduct(null);
//       } else {
//         // Add new product
//         const newProduct: Product = {
//           id: `product_${Date.now()}`,
//           ...formData,
//           createdAt: now,
//           updatedAt: now
//         } as Product;
        
//         saveProducts([...products, newProduct]);
//         setIsAddingProduct(false);
//       }

//       // Reset form
//       setFormData({
//         name: '',
//         description: '',
//         price: 0,
//         category: '',
//         sizes: [],
//         colors: [],
//         imageUrl: '',
//         isActive: true
//       });
//     } catch (error) {
//       console.error('❌ Error submitting product:', error);
//       alert('Failed to save product');
//     }
//   };

//   const handleEdit = (product: Product) => {
//     setFormData(product);
//     setEditingProduct(product.id);
//     setIsAddingProduct(false);
//   };

//   const handleDelete = (productId: string) => {
//     if (confirm('Are you sure you want to delete this product?')) {
//       try {
//         const updatedProducts = products.filter(product => product.id !== productId);
//         saveProducts(updatedProducts);
//       } catch (error) {
//         console.error('❌ Error deleting product:', error);
//         alert('Failed to delete product');
//       }
//     }
//   };

//   const toggleProductStatus = (productId: string) => {
//     try {
//       const updatedProducts = products.map(product =>
//         product.id === productId
//           ? { ...product, isActive: !product.isActive, updatedAt: new Date().toISOString() }
//           : product
//       );
//       saveProducts(updatedProducts);
//     } catch (error) {
//       console.error('❌ Error toggling product status:', error);
//       alert('Failed to update product status');
//     }
//   };

//   const filteredProducts = products.filter(product => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = !categoryFilter || product.category === categoryFilter;
//     return matchesSearch && matchesCategory;
//   });

//   const handleSizeChange = (size: string, checked: boolean) => {
//     const currentSizes = formData.sizes || [];
//     setFormData({
//       ...formData,
//       sizes: checked 
//         ? [...currentSizes, size]
//         : currentSizes.filter(s => s !== size)
//     });
//   };

//   const handleColorChange = (color: string, checked: boolean) => {
//     const currentColors = formData.colors || [];
//     setFormData({
//       ...formData,
//       colors: checked 
//         ? [...currentColors, color]
//         : currentColors.filter(c => c !== color)
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//         <span className="ml-2">Loading products...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">📦 Product Management</h2>
//         <button
//           onClick={() => {
//             setIsAddingProduct(true);
//             setEditingProduct(null);
//             setFormData({
//               name: '',
//               description: '',
//               price: 0,
//               category: '',
//               sizes: [],
//               colors: [],
//               imageUrl: '',
//               isActive: true
//             });
//           }}
//           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//         >
//           <Plus className="w-4 h-4" />
//           Add New Product
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <input
//           type="text"
//           placeholder="Search products..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//         />
//         <select
//           value={categoryFilter}
//           onChange={(e) => setCategoryFilter(e.target.value)}
//           className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Categories</option>
//           {categories.map(category => (
//             <option key={category} value={category}>{category}</option>
//           ))}
//         </select>
//         <button
//           onClick={() => {
//             setSearchTerm('');
//             setCategoryFilter('');
//           }}
//           className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
//         >
//           Clear Filters
//         </button>
//       </div>

//       {/* Add/Edit Form */}
//       {(isAddingProduct || editingProduct) && (
//         <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
//           <h3 className="text-lg font-semibold mb-4">
//             {editingProduct ? 'Edit Product' : 'Add New Product'}
//           </h3>
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Product Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name || ''}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Category *
//                 </label>
//                 <select
//                   value={formData.category || ''}
//                   onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map(category => (
//                     <option key={category} value={category}>{category}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 value={formData.description || ''}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//                 rows={3}
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Price (₹) *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={formData.price || ''}
//                   onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Image URL
//                 </label>
//                 <input
//                   type="url"
//                   value={formData.imageUrl || ''}
//                   onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//                   placeholder="https://example.com/image.jpg"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Available Sizes
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {commonSizes.map(size => (
//                   <label key={size} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={formData.sizes?.includes(size) || false}
//                       onChange={(e) => handleSizeChange(size, e.target.checked)}
//                       className="rounded"
//                     />
//                     <span className="text-sm">{size}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Available Colors
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {commonColors.map(color => (
//                   <label key={color} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={formData.colors?.includes(color) || false}
//                       onChange={(e) => handleColorChange(color, e.target.checked)}
//                       className="rounded"
//                     />
//                     <span className="text-sm">{color}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={formData.isActive || false}
//                   onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                   className="rounded"
//                 />
//                 <span className="text-sm font-medium text-gray-700">Product is active</span>
//               </label>
//             </div>

//             <div className="flex gap-4 pt-4">
//               <button
//                 type="submit"
//                 className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
//               >
//                 <Save className="w-4 h-4" />
//                 {editingProduct ? 'Update Product' : 'Add Product'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setIsAddingProduct(false);
//                   setEditingProduct(null);
//                   setFormData({
//                     name: '',
//                     description: '',
//                     price: 0,
//                     category: '',
//                     sizes: [],
//                     colors: [],
//                     imageUrl: '',
//                     isActive: true
//                   });
//                 }}
//                 className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
//               >
//                 <X className="w-4 h-4" />
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Products List */}
//       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Product
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Category
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Price
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredProducts.map((product) => (
//                 <tr key={product.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       {product.imageUrl && (
//                         <img
//                           src={product.imageUrl}
//                           alt={product.name}
//                           className="h-10 w-10 rounded-lg object-cover mr-4"
//                           onError={(e) => {
//                             (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=No+Image';
//                           }}
//                         />
//                       )}
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">{product.name}</div>
//                         <div className="text-sm text-gray-500">
//                           {product.sizes?.join(', ')} | {product.colors?.join(', ')}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {product.category}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
//                     ₹{product.price.toFixed(2)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <button
//                       onClick={() => toggleProductStatus(product.id)}
//                       className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                         product.isActive
//                           ? 'bg-green-100 text-green-800 hover:bg-green-200'
//                           : 'bg-red-100 text-red-800 hover:bg-red-200'
//                       }`}
//                     >
//                       {product.isActive ? 'Active' : 'Inactive'}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={() => handleEdit(product)}
//                         className="text-indigo-600 hover:text-indigo-900"
//                       >
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(product.id)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {filteredProducts.length === 0 && (
//         <div className="text-center py-8 text-gray-500">
//           {products.length === 0 ? (
//             <div>
//               <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-lg mb-4">No products yet!</p>
//               <p className="text-sm">Start by adding your first product.</p>
//             </div>
//           ) : (
//             'No products found matching your criteria.'
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================================================
// // PURCHASE ANALYTICS COMPONENT
// // ============================================================================

// const PurchaseAnalytics: React.FC = () => {
//   const [purchases, setPurchases] = useState<Purchase[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [lastUpdate, setLastUpdate] = useState<string>('');

//   const loadPurchases = () => {
//     try {
//       setLoading(true);
//       console.log('🔍 Loading purchases from localStorage...');
      
//       const possibleKeys = [
//         'all_purchases',
//         'purchases', 
//         'user_purchases',
//         'purchase_history',
//         'completed_purchases'
//       ];
      
//       let allPurchases: any[] = [];
      
//       possibleKeys.forEach(key => {
//         const data = localStorage.getItem(key);
//         if (data) {
//           try {
//             const parsed = JSON.parse(data);
//             if (Array.isArray(parsed)) {
//               console.log(`📦 Found ${parsed.length} purchases in ${key}`);
//               allPurchases = [...allPurchases, ...parsed];
//             }
//           } catch (e) {
//             console.warn(`⚠️ Could not parse ${key}:`, e);
//           }
//         }
//       });
      
//       // Remove duplicates
//       const uniquePurchases = allPurchases.filter((purchase, index, self) => 
//         index === self.findIndex(p => p.id === purchase.id)
//       );
      
//       console.log(`📊 Loaded ${uniquePurchases.length} unique purchases`);
//       setPurchases(uniquePurchases);
//       setLastUpdate(new Date().toLocaleTimeString());
//     } catch (error) {
//       console.error('❌ Error loading purchases:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadPurchases();
//     // Refresh every 30 seconds
//     const interval = setInterval(loadPurchases, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const totalRevenue = purchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
//   const completedPurchases = purchases.filter(p => p.status === 'completed').length;
//   const pendingPurchases = purchases.filter(p => p.status === 'pending').length;
//   const averageOrderValue = purchases.length > 0 ? totalRevenue / purchases.length : 0;

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//         <span className="ml-2">Loading analytics...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">📊 Purchase Analytics</h2>
//         <div className="flex items-center gap-4">
//           <div className="text-sm text-gray-500">
//             Last updated: {lastUpdate || 'Never'}
//           </div>
//           <button
//             onClick={loadPurchases}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
//           >
//             🔄 Refresh
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-blue-500 text-white p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">Total Orders</h3>
//               <p className="text-3xl font-bold">{purchases.length}</p>
//             </div>
//             <ShoppingCart className="w-8 h-8 opacity-80" />
//           </div>
//         </div>
        
//         <div className="bg-green-500 text-white p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">Total Revenue</h3>
//               <p className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</p>
//             </div>
//             <BarChart3 className="w-8 h-8 opacity-80" />
//           </div>
//         </div>
        
//         <div className="bg-purple-500 text-white p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">Completed</h3>
//               <p className="text-3xl font-bold">{completedPurchases}</p>
//             </div>
//             <CheckCircle className="w-8 h-8 opacity-80" />
//           </div>
//         </div>
        
//         <div className="bg-orange-500 text-white p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">Avg Order</h3>
//               <p className="text-3xl font-bold">₹{averageOrderValue.toFixed(0)}</p>
//             </div>
//             <User className="w-8 h-8 opacity-80" />
//           </div>
//         </div>
//       </div>

//       {/* Purchase List */}
//       {purchases.length > 0 ? (
//         <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900">🛒 Recent Purchases</h3>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {purchases.slice(0, 10).map((purchase, index) => (
//                   <tr key={purchase.id || index} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {purchase.id || `ORDER_${index + 1}`}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {purchase.userName || purchase.userEmail || 'Unknown'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       ₹{purchase.totalAmount || 0}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         {purchase.status || 'pending'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'Unknown'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
//           <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases found!</h3>
//           <p className="text-gray-600">Purchases will appear here once customers complete their orders.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================================================
// // NOTIFICATIONS COMPONENT
// // ============================================================================

// const AdminNotifications: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     // Simulate some notifications for demo
//     const demoNotifications: Notification[] = [
//       {
//         id: '1',
//         type: 'order',
//         title: 'New Order Received',
//         message: 'Order #12345 for ₹1599 from john@example.com',
//         timestamp: new Date().toISOString(),
//         read: false,
//         priority: 'high',
//         order: {
//           id: '12345',
//           totalAmount: 1599,
//           userName: 'John Doe',
//           userEmail: 'john@example.com'
//         }
//       }
//     ];
//     setNotifications(demoNotifications);
//   }, []);

//   const markAsRead = (notificationId: string) => {
//     setNotifications(prev => 
//       prev.map(notif => 
//         notif.id === notificationId 
//           ? { ...notif, read: true }
//           : notif
//       )
//     );
//   };

//   const dismissNotification = (notificationId: string) => {
//     setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">🔔 Admin Notifications</h2>
//         <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
//           isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           <div className={`w-2 h-2 rounded-full mr-2 ${
//             isConnected ? 'bg-green-500' : 'bg-red-500'
//           }`}></div>
//           {isConnected ? 'Connected' : 'Disconnected'}
//         </div>
//       </div>

//       {/* Notifications List */}
//       <div className="space-y-4">
//         {notifications.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center">
//             <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
//             <p className="text-gray-600">You'll see order notifications here when they arrive.</p>
//           </div>
//         ) : (
//           notifications.map((notification) => (
//             <div
//               key={notification.id}
//               className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
//                 notification.read ? 'border-gray-300' : 'border-blue-500'
//               }`}
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex items-start space-x-4">
//                   <div className={`p-3 rounded-full ${
//                     notification.priority === 'critical' ? 'bg-red-100' :
//                     notification.priority === 'high' ? 'bg-orange-100' :
//                     'bg-blue-100'
//                   }`}>
//                     <Bell className={`w-6 h-6 ${
//                       notification.priority === 'critical' ? 'text-red-600' :
//                       notification.priority === 'high' ? 'text-orange-600' :
//                       'text-blue-600'
//                     }`} />
//                   </div>
                  
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <h3 className="text-lg font-semibold text-gray-900">
//                         {notification.title}
//                       </h3>
//                       {notification.priority === 'critical' && (
//                         <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
//                           🚨 URGENT
//                         </span>
//                       )}
//                     </div>
                    
//                     <p className="text-gray-600 mb-2">{notification.message}</p>
                    
//                     <div className="text-sm text-gray-500">
//                       {new Date(notification.timestamp).toLocaleString()}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => markAsRead(notification.id)}
//                     className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
//                     title="Mark as read"
//                   >
//                     <CheckCircle className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={() => dismissNotification(notification.id)}
//                     className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
//                     title="Dismiss"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // ADMIN LOGIN FORM COMPONENT
// // ============================================================================

// const AdminLoginForm = ({ onLogin }: { onLogin: (email: string, password: string) => void }) => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       await onLogin(formData.email, formData.password);
//     } catch (err: any) {
//       setError(err.message || 'Login failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleQuickLogin = (email: string, password: string) => {
//     setFormData({ email, password });
//     onLogin(email, password);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
//         <div className="text-center mb-8">
//           <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900">🔒 Admin Login</h2>
//           <p className="text-gray-600 mt-2">Enter your admin credentials to continue</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Admin Email
//             </label>
//             <input
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="admin@tshirtapp.com"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter admin password"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
//           >
//             {isLoading ? 'Logging in...' : 'Login to Admin Dashboard'}
//           </button>
//         </form>

//         {/* Quick Login Options for Development */}
//         <div className="mt-8 pt-6 border-t border-gray-200">
//           <p className="text-sm text-gray-600 mb-4 text-center">Quick Login (Development Only)</p>
//           <div className="space-y-2">
//             <button
//               onClick={() => handleQuickLogin('admin@tshirtapp.com', 'admin123')}
//               className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
//             >
//               🚀 Login as Admin
//             </button>
//             <button
//               onClick={() => handleQuickLogin('superadmin@tshirtapp.com', 'super123')}
//               className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
//             >
//               👑 Login as Super Admin
//             </button>
//           </div>
//         </div>

//         <div className="mt-6 text-center">
//           <button
//             onClick={() => window.location.href = '/'}
//             className="text-gray-500 hover:text-gray-700 text-sm"
//           >
//             ← Back to Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // MAIN ADMIN DASHBOARD COMPONENT
// // ============================================================================

// const AdminDashboard: React.FC = () => {
//   const { user, logout } = useAuth();
//   const [activeTab, setActiveTab] = useState('notifications');

//   // Enhanced admin check
//   const isAdmin = user?.email === 'admin@tshirtapp.com' || 
//                   user?.email === 'superadmin@tshirtapp.com' ||
//                   user?.role === 'admin' || 
//                   user?.role === 'superadmin';

//   // Handle admin login
//   const handleAdminLogin = async (email: string, password: string) => {
//     const validCredentials = [
//       { email: 'admin@tshirtapp.com', password: 'admin123', role: 'admin' },
//       { email: 'superadmin@tshirtapp.com', password: 'super123', role: 'superadmin' }
//     ];

//     const validUser = validCredentials.find(
//       cred => cred.email === email && cred.password === password
//     );

//     if (validUser) {
//       const adminUser = {
//         id: validUser.role === 'superadmin' ? 'superadmin_001' : 'admin_001',
//         email: validUser.email,
//         firstName: validUser.role === 'superadmin' ? 'Super' : 'Admin',
//         lastName: 'User',
//         name: validUser.role === 'superadmin' ? 'Super Admin' : 'Admin User',
//         role: validUser.role
//       };

//       localStorage.setItem('current_user', JSON.stringify(adminUser));
//       console.log('✅ Admin login successful:', adminUser);
//       window.location.reload();
//     } else {
//       throw new Error('Invalid admin credentials');
//     }
//   };

//   // If not logged in, show login form
//   if (!user) {
//     return <AdminLoginForm onLogin={handleAdminLogin} />;
//   }

//   // If logged in but not admin, show access denied
//   if (!isAdmin) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
//           <User className="w-16 h-16 text-orange-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">⛔ Access Denied</h2>
//           <p className="text-gray-600 mb-4">
//             You're logged in as: <strong>{user.email}</strong>
//           </p>
//           <p className="text-gray-600 mb-6">But you don't have admin permissions.</p>
          
//           <div className="space-y-4">
//             <button
//               onClick={() => {
//                 logout();
//                 window.location.reload();
//               }}
//               className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
//             >
//               🔓 Logout & Login as Admin
//             </button>
            
//             <button
//               onClick={() => window.location.href = '/'}
//               className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
//             >
//               ← Back to Home
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Main Admin Dashboard
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Admin Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-6 flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
//               <p className="text-gray-600 mt-1">
//                 Welcome, <strong>{user.name || user.email}</strong>
//               </p>
//             </div>
            
//             <div className="flex items-center gap-4">
//               <div className="text-sm text-gray-600">
//                 Role: <span className="font-medium text-green-600">{user.role || 'Admin'}</span>
//               </div>
//               <button
//                 onClick={() => {
//                   logout();
//                   window.location.href = '/';
//                 }}
//                 className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
//               >
//                 <LogOut className="w-4 h-4" />
//                 Logout
//               </button>
//             </div>
//           </div>
          
//           {/* Navigation Tabs */}
//           <div className="border-b border-gray-200">
//             <nav className="-mb-px flex space-x-8">
//               <button
//                 onClick={() => setActiveTab('notifications')}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
//                   activeTab === 'notifications'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <Bell className="w-4 h-4" />
//                 🔔 Notifications
//               </button>
              
//               <button
//                 onClick={() => setActiveTab('analytics')}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
//                   activeTab === 'analytics'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <BarChart3 className="w-4 h-4" />
//                 📊 Analytics
//               </button>
              
//               <button
//                 onClick={() => setActiveTab('products')}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
//                   activeTab === 'products'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <Package className="w-4 h-4" />
//                 📦 Products
//               </button>
//             </nav>
//           </div>
//         </div>
//       </div>

//       {/* Content Area */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {activeTab === 'notifications' && <AdminNotifications />}
//         {activeTab === 'analytics' && <PurchaseAnalytics />}
//         {activeTab === 'products' && <ProductManagement />}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;