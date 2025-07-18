// src/pages/AdminPage.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminAddProduct from './AdminAddProduct'; // ✅ Product management
import AdminNotifications from '../components/AdminNotifications'; // ✅ Notifications
import { ShoppingCart, Package, Shield, User, LogOut, Eye, EyeOff, Bell, BarChart3 } from 'lucide-react';

// ✅ Purchase Analytics Component (moved from AdminDashboard.tsx)
const PurchaseAnalytics = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Function to load purchases from multiple possible localStorage keys
  const loadPurchases = () => {
    console.log('🔍 Admin: Loading purchases from localStorage...');
    
    // Check ALL localStorage keys to find where purchases might be stored
    const allLocalStorageKeys = Object.keys(localStorage);
    console.log('🗂️ All localStorage keys:', allLocalStorageKeys);
    
    // Check specific keys where purchases might be stored
    const possibleKeys = [
      'all_purchases',
      'purchases', 
      'user_purchases',
      'purchase_history',
      'completed_purchases',
      'cart_purchases',
      'purchase_data',
      'orders',
      'transactions',
      'payment_history',
      'user_orders'
    ];
    
    let allPurchases: any[] = [];
    
    // Check our expected keys
    possibleKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            console.log(`📦 Found ${parsed.length} purchases in ${key}`);
            allPurchases = [...allPurchases, ...parsed];
          } else if (parsed && typeof parsed === 'object') {
            console.log(`📦 Found single purchase in ${key}`);
            allPurchases.push(parsed);
          }
        } catch (e) {
          console.warn(`⚠️ Could not parse ${key}:`, e);
        }
      }
    });
    
    // Also check ALL localStorage keys for anything that looks like purchase data
    allLocalStorageKeys.forEach(key => {
      if (!possibleKeys.includes(key)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            // Check if this might be purchase data
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstItem = parsed[0];
              if (firstItem && typeof firstItem === 'object' && 
                  (firstItem.totalAmount || firstItem.amount || firstItem.price || 
                   firstItem.items || firstItem.products || firstItem.cart)) {
                console.log(`🔍 Possible purchase data found in key "${key}":`, parsed);
                allPurchases = [...allPurchases, ...parsed];
              }
            } else if (parsed && typeof parsed === 'object' && 
                      (parsed.totalAmount || parsed.amount || parsed.price || 
                       parsed.items || parsed.products || parsed.cart)) {
              console.log(`🔍 Possible single purchase found in key "${key}":`, parsed);
              allPurchases.push(parsed);
            }
          } catch (e) {
            // Not JSON, skip
          }
        }
      }
    });
    
    // Remove duplicates based on ID
    const uniquePurchases = allPurchases.filter((purchase, index, self) => 
      index === self.findIndex(p => (p.id && p.id === purchase.id) || 
                                   (p.orderId && p.orderId === purchase.orderId) ||
                                   index === self.indexOf(purchase))
    );
    
    console.log(`📊 Admin: Loaded ${uniquePurchases.length} unique purchases`);
    console.log('🔍 Purchase data:', uniquePurchases);
    
    setPurchases(uniquePurchases);
    setLastUpdate(new Date().toLocaleTimeString());
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
    const interval = setInterval(loadPurchases, 2000); // Check every 2 seconds
    
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            🔄 Refresh
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🛒 Recent Purchases</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.status || 'pending'}
                      </span>
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
              Purchase data will be stored in MongoDB once you set up the backend database connection. 
              For now, this shows any test data from localStorage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Admin Login Form Component
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications'); // Default to notifications

  // Debug info
  console.log('🔍 AdminPage - Current user:', user);
  console.log('🔍 AdminPage - User email:', user?.email);

  // Enhanced admin check
  const isAdmin = user?.email === 'admin@tshirtapp.com' || 
                  user?.email === 'superadmin@tshirtapp.com' ||
                  user?.role === 'admin' || 
                  user?.role === 'superadmin';
  
  console.log('🔍 AdminPage - Is admin?', isAdmin);

  // Handle admin login
  const handleAdminLogin = async (email: string, password: string) => {
    console.log('🔐 Admin login attempt:', email);

    // Validate admin credentials
    const validCredentials = [
      { email: 'admin@tshirtapp.com', password: 'admin123', role: 'admin' },
      { email: 'superadmin@tshirtapp.com', password: 'super123', role: 'superadmin' }
    ];

    const validUser = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (validUser) {
      // Create admin user object
      const adminUser = {
        id: validUser.role === 'superadmin' ? 'superadmin_001' : 'admin_001',
        email: validUser.email,
        firstName: validUser.role === 'superadmin' ? 'Super' : 'Admin',
        lastName: 'User',
        name: validUser.role === 'superadmin' ? 'Super Admin' : 'Admin User',
        role: validUser.role
      };

      // Save to localStorage (simulate login)
      localStorage.setItem('current_user', JSON.stringify(adminUser));
      console.log('✅ Admin login successful:', adminUser);
      
      // Reload page to trigger auth context update
      window.location.reload();
    } else {
      throw new Error('Invalid admin credentials');
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
    <div className="min-h-screen bg-gray-50">
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
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="w-4 h-4" />
                🔔 Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                📊 Analytics
              </button>
              
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'products'
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