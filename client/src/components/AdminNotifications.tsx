// ============================================================================
// File: client/src/components/admin/AdminNotifications.tsx - FIXED VERSION
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Bell, Package, User, Clock, DollarSign, X, Check, RefreshCw, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'alert' | 'info' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  order?: {
    id: string;
    totalAmount: number;
    userName: string;
    userEmail: string;
    items?: Array<{
      productName: string;
      quantity: number;
      size?: string;
    }>;
  };
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Simulate connection status
  useEffect(() => {
    // Simulate connection after 2 seconds
    const timer = setTimeout(() => {
      setIsConnected(true);
      loadNotifications();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-refresh notifications
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadNotifications = () => {
    try {
      // Load notifications from localStorage or simulate them
      const savedNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      
      // If no saved notifications, create some demo ones
      if (savedNotifications.length === 0) {
        const demoNotifications = generateDemoNotifications();
        setNotifications(demoNotifications);
        localStorage.setItem('admin_notifications', JSON.stringify(demoNotifications));
      } else {
        setNotifications(savedNotifications);
      }
      
      setLastUpdate(new Date().toLocaleTimeString());
      console.log('🔔 Notifications loaded:', savedNotifications.length);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  };

  const generateDemoNotifications = (): Notification[] => {
    const now = new Date();
    return [
      {
        id: 'notif_1',
        type: 'order',
        title: 'New Order Received',
        message: 'Order #12345 for ₹1599 from John Doe',
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
        read: false,
        priority: 'high',
        order: {
          id: '12345',
          totalAmount: 1599,
          userName: 'John Doe',
          userEmail: 'john@example.com',
          items: [
            { productName: 'Naruto T-Shirt', quantity: 1, size: 'L' },
            { productName: 'Anime Hoodie', quantity: 1, size: 'M' }
          ]
        }
      },
      {
        id: 'notif_2',
        type: 'alert',
        title: 'Low Stock Alert',
        message: 'Naruto T-Shirt (Size L) is running low on stock',
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
        read: false,
        priority: 'medium'
      },
      {
        id: 'notif_3',
        type: 'order',
        title: 'Order Completed',
        message: 'Order #12344 has been successfully processed',
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
        read: true,
        priority: 'low',
        order: {
          id: '12344',
          totalAmount: 799,
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          items: [
            { productName: 'Dragon Ball Phone Cover', quantity: 1 }
          ]
        }
      },
      {
        id: 'notif_4',
        type: 'system',
        title: 'System Update',
        message: 'Admin dashboard has been updated with new features',
        timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), // 1 hour ago
        read: true,
        priority: 'low'
      }
    ];
  };

  const playNotificationSound = () => {
    if (soundEnabled) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/admin-icon.png',
        tag: notification.id
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      
      if (permission === 'granted') {
        alert('Browser notifications enabled!');
      } else {
        alert('Browser notifications denied. You can enable them in your browser settings.');
      }
    } else {
      alert('Browser notifications not supported in this browser.');
    }
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
  };

  const dismissNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      localStorage.removeItem('admin_notifications');
    }
  };

  const addTestNotification = () => {
    const testNotification: Notification = {
      id: `test_${Date.now()}`,
      type: 'order',
      title: 'Test Notification',
      message: `Test notification created at ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium',
      order: {
        id: `TEST_${Date.now()}`,
        totalAmount: 1299,
        userName: 'Test Customer',
        userEmail: 'test@example.com',
        items: [
          { productName: 'Test Product', quantity: 1, size: 'M' }
        ]
      }
    };

    const updatedNotifications = [testNotification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
    
    if (soundEnabled) {
      playNotificationSound();
    }
    showBrowserNotification(testNotification);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
              <p className="text-gray-600">Real-time order alerts and system notifications</p>
              {unreadCount > 0 && (
                <p className="text-sm text-orange-600 font-medium">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  {criticalCount > 0 && ` (${criticalCount} critical)`}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>

            {/* Settings */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-1 rounded-full text-sm ${
                  soundEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
                title={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                🔊 {soundEnabled ? 'On' : 'Off'}
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-full text-sm ${
                  autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
                title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
              >
                <RefreshCw className={`w-3 h-3 inline mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={requestNotificationPermission}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Enable Browser Notifications
            </button>

            <button
              onClick={addTestNotification}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              Test Notification
            </button>

            <button
              onClick={loadNotifications}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Last updated: {lastUpdate || 'Never'}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600 mb-4">You'll see order notifications here when they arrive.</p>
            <button
              onClick={addTestNotification}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Create Test Notification
            </button>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all ${
                notification.read ? 'border-gray-300 opacity-75' : 
                notification.priority === 'critical' ? 'border-red-500 shadow-lg' :
                notification.priority === 'high' ? 'border-orange-500' :
                'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-full ${
                    notification.priority === 'critical' ? 'bg-red-100' :
                    notification.priority === 'high' ? 'bg-orange-100' :
                    notification.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {notification.type === 'order' ? (
                      <Package className={`w-6 h-6 ${
                        notification.priority === 'critical' ? 'text-red-600' :
                        notification.priority === 'high' ? 'text-orange-600' :
                        notification.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    ) : notification.type === 'system' ? (
                      <Settings className={`w-6 h-6 ${
                        notification.priority === 'critical' ? 'text-red-600' :
                        notification.priority === 'high' ? 'text-orange-600' :
                        notification.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    ) : (
                      <Bell className={`w-6 h-6 ${
                        notification.priority === 'critical' ? 'text-red-600' :
                        notification.priority === 'high' ? 'text-orange-600' :
                        notification.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {notification.priority === 'critical' && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          🚨 CRITICAL
                        </span>
                      )}
                      {notification.priority === 'high' && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                          ⚠️ HIGH
                        </span>
                      )}
                      {!notification.read && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          NEW
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{notification.message}</p>

                    {/* Order Details */}
                    {notification.order && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Order Details:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
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

                        {notification.order.items && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Items:</h5>
                            {notification.order.items.map((item, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {item.productName} {item.size && `(${item.size})`} × {item.quantity}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Actions for Orders */}
              {notification.order && notification.type === 'order' && (
                <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    View Order
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                    Process Order
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
                    Contact Customer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;