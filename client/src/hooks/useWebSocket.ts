// ============================================================================
// File: client/src/hooks/useWebSocket.ts - FIXED VERSION
// ============================================================================

import { useEffect, useState, useRef } from 'react';

// Simple WebSocket hook without socket.io dependency
export const useWebSocket = (serverUrl: string = 'ws://localhost:5000') => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      console.log('🔌 Attempting WebSocket connection to:', serverUrl);
      
      const ws = new WebSocket(serverUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully!');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📩 WebSocket message received:', data);
          
          // Handle different message types
          if (data.type === 'welcome') {
            console.log('👋 Welcome message:', data);
          } else if (data.type === 'notification') {
            console.log('🔔 Notification received:', data);
            // You can add custom notification handling here
          }
        } catch (error) {
          console.log('📩 Raw WebSocket message:', event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          console.log(`🔄 Reconnecting in ${timeout}ms... (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, timeout);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setConnectionError('Failed to reconnect after maximum attempts');
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close(1000, 'Component unmounting');
      }
    };
  }, [serverUrl]);

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        socket.send(messageStr);
        console.log('📤 Message sent:', message);
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        setConnectionError('Failed to send message');
      }
    } else {
      console.error('❌ Cannot send message: Socket not connected');
      setConnectionError('Cannot send message: Not connected to server');
    }
  };

  const authenticateAdmin = (adminData: any) => {
    sendMessage({
      type: 'admin-login',
      data: adminData
    });
  };

  const sendTestNotification = () => {
    sendMessage({
      type: 'test-notification',
      data: { message: 'Test notification from admin' }
    });
  };

  const manualReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setReconnectAttempts(0);
    setConnectionError('Attempting to reconnect...');
    connect();
  };

  return {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    sendMessage,
    authenticateAdmin,
    sendTestNotification,
    manualReconnect
  };
};

// ============================================================================
// Alternative Socket.IO Hook (if you have socket.io installed)
// ============================================================================

// Uncomment this if you want to use socket.io instead of native WebSocket
/*
import { io, Socket } from 'socket.io-client';

export const useSocketIO = (serverUrl: string = 'http://localhost:5000') => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔌 Attempting Socket.IO connection to:', serverUrl);
    
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully!');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      setConnectionError(`Connection failed: ${error.message}`);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 Cleaning up Socket.IO connection');
      newSocket.close();
    };
  }, [serverUrl]);

  const authenticateAdmin = (adminData: any) => {
    if (socket && isConnected) {
      socket.emit('admin-login', adminData);
    }
  };

  const sendTestNotification = () => {
    if (socket && isConnected) {
      socket.emit('send-test-notification');
    }
  };

  return {
    socket,
    isConnected,
    connectionError,
    authenticateAdmin,
    sendTestNotification
  };
};
*/