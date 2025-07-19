// admin/AdminNotifications.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, User, Clock, DollarSign, X, Check } from 'lucide-react';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

// Add notification type
interface OrderItem {
  productName: string;
  quantity: number;
  size?: string;
}

interface OrderInfo {
  id: string;
  totalAmount: number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
}

interface OrderNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'critical' | 'high' | 'normal';
  order: OrderInfo;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isConnected, setIsConnected] = useState(true); // Always true for API
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderModal, setOrderModal] = useState<OrderInfo | null>(null); // For order details modal
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevNotifIds = useRef<string[]>([]);

  // Fetch all real orders as notifications
  const fetchOrderNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) throw new Error('No admin token found. Please login as admin.');
      const response = await fetch(`${API_BASE}/api/purchases/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (!data.success || !Array.isArray(data.data)) throw new Error(data.message || 'Failed to fetch orders');
      // Convert each order to a notification object
      const orderNotifs: OrderNotification[] = data.data.map((order: any) => ({
        id: order._id,
        type: 'order',
        title: 'New Order Received',
        message: `Order #${order._id} for ₹${order.totalAmount} from ${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.trim(),
        timestamp: order.createdAt,
        read: false,
        priority: 'high',
        order: {
          id: order._id,
          totalAmount: order.totalAmount,
          userName: order.userId?.firstName && order.userId?.lastName ? `${order.userId.firstName} ${order.userId.lastName}` : order.userId?.email || 'Unknown',
          userEmail: order.userId?.email || 'Unknown',
          items: (order.items || []).map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            size: item.size
          }))
        }
      }));
      // Play sound if new notification arrives
      const newIds = orderNotifs.map(n => n.id);
      const prevIds = prevNotifIds.current;
      if (soundEnabled && audioRef.current && prevIds.length > 0) {
        // Play sound if there are new notifications
        const newNotif = newIds.find(id => !prevIds.includes(id));
        if (newNotif) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      }
      prevNotifIds.current = newIds;
      setNotifications(orderNotifs);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderNotifications();
    // Optionally, poll every 30s for new orders
    const interval = setInterval(fetchOrderNotifications, 30000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => notif.id === notificationId ? { ...notif, read: true } : notif));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // Process Order: update status to 'processing'
  const handleProcessOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) throw new Error('No admin token found. Please login as admin.');
      const response = await fetch(`${API_BASE}/api/purchases/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'processing' })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to update status');
      alert('Order status updated to Processing!');
      fetchOrderNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to process order');
    }
  };

  // Contact Customer: open mailto link
  const handleContactCustomer = (email: string) => {
    window.open(`mailto:${email}?subject=Regarding your order&body=Hello,`, '_blank');
  };

  // View Order: show modal with order details
  const handleViewOrder = (order: OrderInfo) => {
    setOrderModal(order);
  };

  const closeOrderModal = () => setOrderModal(null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Notification sound */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" style={{ display: 'none' }} />
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
              <p className="text-gray-600">Real-time order alerts and system notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={fetchOrderNotifications}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1 rounded-full text-sm ${soundEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
            >
              🔊 {soundEnabled ? 'Sound On' : 'Sound Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center mb-4">{error}</div>
        )}
        {notifications.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No order notifications yet</h3>
            <p className="text-gray-600">You'll see order notifications here when they arrive.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${notification.read ? 'border-gray-300' : 'border-blue-500'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${notification.priority === 'critical' ? 'bg-red-100' : notification.priority === 'high' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                    <Package className={`w-6 h-6 ${notification.priority === 'critical' ? 'text-red-600' : notification.priority === 'high' ? 'text-orange-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        New Order #{notification.order.id}
                      </h3>
                      {notification.priority === 'critical' && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">🚨 URGENT</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {notification.order.userName}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ₹{notification.order.totalAmount}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        {notification.order.items?.length || 0} items
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {/* Order Items */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                      {notification.order.items?.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {item.productName} {item.size && `(${item.size})`} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  onClick={() => handleViewOrder(notification.order)}
                >
                  View Order
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  onClick={() => handleProcessOrder(notification.order.id)}
                >
                  Process Order
                </button>
                <button
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                  onClick={() => handleContactCustomer(notification.order.userEmail)}
                >
                  Contact Customer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeOrderModal}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Order #{orderModal.id}</h2>
            <div className="mb-2"><strong>Customer:</strong> {orderModal.userName}</div>
            <div className="mb-2"><strong>Email:</strong> {orderModal.userEmail}</div>
            <div className="mb-2"><strong>Total Amount:</strong> ₹{orderModal.totalAmount}</div>
            <div className="mb-2"><strong>Items:</strong></div>
            <ul className="list-disc pl-6">
              {orderModal.items.map((item, idx) => (
                <li key={idx}>{item.productName} {item.size && `(${item.size})`} × {item.quantity}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;