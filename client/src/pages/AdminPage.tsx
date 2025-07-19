// src/pages/AdminPage.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminAddProduct from './AdminAddProduct'; // ✅ Product management
import AdminNotifications from '../components/AdminNotifications'; // ✅ Notifications
import { ShoppingCart, Package, Shield, User, LogOut, Eye, EyeOff, Bell, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';

// ✅ Purchase Analytics Component (moved from AdminDashboard.tsx)
const PurchaseAnalytics = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Function to load purchases from MongoDB via API
  const loadPurchases = async () => {
    console.log('🔍 Admin: Loading purchases from MongoDB...');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      console.log('🔐 Admin - Token available:', !!token);

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/api/purchases/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Admin: MongoDB purchases response:', data);

      if (data.success && data.data) {
        // Transform MongoDB data to match expected format
        const transformedPurchases = data.data.map((purchase: any) => ({
          id: purchase._id,
          orderId: purchase._id,
          userId: purchase.userId?._id || purchase.userId,
          userEmail: purchase.userId?.email || 'Unknown',
          userName: purchase.userId?.firstName && purchase.userId?.lastName
            ? `${purchase.userId.firstName} ${purchase.userId.lastName}`
            : purchase.userId?.email || 'Unknown',
          totalAmount: purchase.totalAmount,
          amount: purchase.totalAmount,
          status: purchase.status,
          createdAt: purchase.createdAt,
          items: purchase.items || [],
          paymentMethod: purchase.paymentMethod,
          shippingAddress: purchase.shippingAddress
        }));

        console.log(`📊 Admin: Loaded ${transformedPurchases.length} purchases from MongoDB`);
        setPurchases(transformedPurchases);
      } else {
        console.warn('⚠️ No purchase data in response:', data);
        setPurchases([]);
      }
    } catch (error) {
      console.error('❌ Failed to load purchases from MongoDB:', error);

      // Fallback to localStorage if MongoDB fails
      console.log('🔄 Falling back to localStorage...');
      loadPurchasesFromLocalStorage();
    } finally {
      setIsLoading(false);
      setLastUpdate(new Date().toLocaleTimeString());
    }
  };

  // Fallback function to load from localStorage
  const loadPurchasesFromLocalStorage = () => {
    console.log('🔍 Admin: Loading purchases from localStorage (fallback)...');

    const allLocalStorageKeys = Object.keys(localStorage);
    const possibleKeys = [
      'all_purchases', 'purchases', 'user_purchases', 'purchase_history',
      'completed_purchases', 'cart_purchases', 'purchase_data',
      'orders', 'transactions', 'payment_history', 'user_orders'
    ];

    let allPurchases: any[] = [];

    possibleKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            allPurchases = [...allPurchases, ...parsed];
          } else if (parsed && typeof parsed === 'object') {
            allPurchases.push(parsed);
          }
        } catch (e) {
          console.warn(`⚠️ Could not parse ${key}:`, e);
        }
      }
    });

    const uniquePurchases = allPurchases.filter((purchase, index, self) =>
      index === self.findIndex(p => (p.id && p.id === purchase.id) ||
        (p.orderId && p.orderId === purchase.orderId) ||
        index === self.indexOf(purchase))
    );

    setPurchases(uniquePurchases);
  };

  // Function to update purchase status
  const updatePurchaseStatus = async (purchaseId: string, newStatus: string) => {
    setStatusUpdating(purchaseId);
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found. Please login again.');
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/api/purchases/${purchaseId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to update status');
      // Update the local state
      setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, status: newStatus } : p));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(null);
    }
  };

  // Load purchases on component mount
  useEffect(() => {
    loadPurchases();
  }, []);

  // Listen for localStorage changes and refresh purchases
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📡 localStorage changed, reloading purchases...');
      loadPurchases();
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(loadPurchases, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const totalRevenue = purchases.reduce((sum: number, purchase: any) => {
    const amount = purchase.totalAmount || purchase.total || purchase.amount || 0;
    return sum + amount;
  }, 0);

  const completedPurchases = purchases.filter((p: any) =>
    p.status === 'completed' || p.status === 'success' || p.status === 'paid'
  ).length;

  const averageOrderValue = purchases.length > 0 ? totalRevenue / purchases.length : 0;

  // Get recent purchases (last 7 days)
  const recentPurchases = purchases.filter((p: any) => {
    const purchaseDate = new Date(p.createdAt || p.timestamp || Date.now());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return purchaseDate >= weekAgo;
  });

  // Helper for status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Download as Excel handler
  const handleDownloadExcel = () => {
    // Prepare data for Excel
    const data = purchases.slice(0, 10).map((purchase: any) => ({
      'Order ID': purchase.id || purchase.orderId,
      'Customer': purchase.userName || purchase.userEmail || 'Unknown',
      'Amount': purchase.totalAmount || purchase.amount || 0,
      'Items': Array.isArray(purchase.items) && purchase.items.length > 0
        ? purchase.items.map((item: any) => `${item.productName} x${item.quantity}${item.size ? ` (${item.size})` : ''}`).join(', ')
        : '-',
      'Status': purchase.status || 'pending',
      'Date': purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'Unknown',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchases');
    XLSX.writeFile(workbook, 'purchases.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📊 Purchase Analytics</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate || 'Never'}
          </div>
          <button
            onClick={loadPurchases}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                🔄 Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Total Orders</h3>
              <p className="text-3xl font-bold">{purchases.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Total Revenue</h3>
              <p className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</p>
            </div>
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-purple-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-3xl font-bold">{completedPurchases}</p>
            </div>
            <Package className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-orange-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Avg Order</h3>
              <p className="text-3xl font-bold">₹{averageOrderValue.toFixed(0)}</p>
            </div>
            <User className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent Activity (Last 7 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Recent Orders</p>
            <p className="text-2xl font-bold text-blue-600">{recentPurchases.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Recent Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{recentPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Purchase List */}
      {purchases.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🛒 Recent Purchases</h3>
            <button
              onClick={handleDownloadExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              ⬇️ Download as Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.slice(0, 10).map((purchase, index) => (
                  <tr key={purchase.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {purchase.id || purchase.orderId || `ORDER_${index + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {purchase.userName || purchase.userEmail || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{purchase.totalAmount || purchase.amount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Array.isArray(purchase.items) && purchase.items.length > 0 ? (
                        purchase.items.map((item, idx) => (
                          <span key={idx}>
                            {item.productName} x{item.quantity}{item.size ? ` (${item.size})` : ''}{idx < purchase.items.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={purchase.status || 'pending'}
                        onChange={e => updatePurchaseStatus(purchase.id, e.target.value)}
                        disabled={statusUpdating === purchase.id}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border focus:outline-none ${getStatusBadgeClass(purchase.status)}`}
                        style={{ minWidth: 100 }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                        <option value="completed">Completed</option>
                      </select>
                      {statusUpdating === purchase.id && (
                        <span className="ml-2 text-xs text-gray-400 animate-pulse">Updating...</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {purchases.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases found!</h3>
          <p className="text-gray-600 mb-4">
            Purchases will appear here once customers complete their orders.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-blue-800 mb-2">💾 Database Notice</h4>
            <p className="text-sm text-blue-700">
              Purchase data is now stored in MongoDB! This shows real purchase data from the database.
              If no purchases appear, it means no orders have been placed yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Admin Login Form - Now uses real backend API
const AdminLoginForm = ({ onLogin }: { onLogin: (email: string, password: string) => void }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onLogin(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string, password: string) => {
    setFormData({ email, password });
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">🔒 Admin Login</h2>
          <p className="text-gray-600 mt-2">Enter your admin credentials to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@tshirtapp.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login to Admin Dashboard'}
          </button>
        </form>

        {/* Quick Login Options for Development */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4 text-center">Quick Login (Development Only)</p>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('admin@tshirtapp.com', 'admin123')}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              🚀 Login as Admin (admin@tshirtapp.com / admin123)
            </button>
            <button
              onClick={() => handleQuickLogin('user@test.com', 'user123')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              👤 Login as User (user@test.com / user123)
            </button>
            <button
              onClick={() => handleQuickLogin('superadmin@tshirtapp.com', 'super123')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              👑 Login as Super Admin (superadmin@tshirtapp.com / super123)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ MAIN ADMIN PAGE COMPONENT
const AdminPage: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications'); // Default to notifications

  // Debug info
  console.log('🔍 AdminPage - Current user:', user);
  console.log('🔍 AdminPage - User email:', user?.email);

  // Enhanced admin check - now checks for admin role from backend
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  console.log('🔍 AdminPage - Is admin?', isAdmin);

  // Handle admin login using real backend API
  const handleAdminLogin = async (email: string, password: string) => {
    console.log('🔐 Admin login attempt:', email);

    try {
      // Use the real login function from AuthContext
      await login(email, password, true); // Remember me = true for admin
      console.log('✅ Admin login successful');

      // The AuthContext will handle storing the user data and tokens
      // No need to manually reload the page

    } catch (error: any) {
      console.error('❌ Admin login failed:', error);
      throw error; // Re-throw to be handled by the form
    }
  };

  // If not logged in, show login form
  if (!user) {
    return <AdminLoginForm onLogin={handleAdminLogin} />;
  }

  // If logged in but not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <User className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⛔ Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You're logged in as: <strong>{user.email}</strong>
          </p>
          <p className="text-gray-600 mb-6">But you don't have admin permissions.</p>

          <div className="space-y-4">
            <button
              onClick={() => {
                logout();
                window.location.reload();
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              🔓 Logout & Login as Admin
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50 p-20">
      {/* ✅ Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome, <strong>{user.name || user.email}</strong>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Role: <span className="font-medium text-green-600">{user.role || 'Admin'}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* ✅ Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Bell className="w-4 h-4" />
                🔔 Notifications
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <BarChart3 className="w-4 h-4" />
                📊 Analytics
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Package className="w-4 h-4" />
                📦 Products
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* ✅ Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'notifications' && <AdminNotifications />}
        {activeTab === 'analytics' && <PurchaseAnalytics />}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <AdminAddProduct />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;