// server/index.ts
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
var useWebSocket = (serverUrl = "http://localhost:5000") => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  useEffect(() => {
    console.log("\u{1F50C} Attempting WebSocket connection to:", serverUrl);
    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      // Try both
      timeout: 1e4,
      autoConnect: true,
      forceNew: true,
      // Force new connection
      reconnection: true,
      reconnectionDelay: 1e3,
      reconnectionDelayMax: 5e3,
      maxReconnectionAttempts: 5
    });
    newSocket.on("connect", () => {
      console.log("\u2705 WebSocket connected successfully!");
      console.log("\u{1F194} Socket ID:", newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
    });
    newSocket.on("welcome", (data) => {
      console.log("\u{1F44B} Welcome message:", data);
    });
    newSocket.on("connect_error", (error) => {
      console.error("\u274C WebSocket connection error:", error);
      setConnectionError(`Connection failed: ${error.message}`);
      setIsConnected(false);
      setReconnectAttempts((prev) => prev + 1);
    });
    newSocket.on("disconnect", (reason) => {
      console.log("\u{1F50C} WebSocket disconnected:", reason);
      setIsConnected(false);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });
    newSocket.on("reconnecting", (attemptNumber) => {
      console.log("\u{1F504} Reconnecting attempt:", attemptNumber);
      setConnectionError(`Reconnecting... (attempt ${attemptNumber})`);
    });
    newSocket.on("reconnect", () => {
      console.log("\u2705 Reconnected successfully!");
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
    });
    newSocket.on("reconnect_failed", () => {
      console.error("\u274C Reconnection failed after maximum attempts");
      setConnectionError("Failed to reconnect to server");
    });
    setSocket(newSocket);
    return () => {
      console.log("\u{1F9F9} Cleaning up WebSocket connection");
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("disconnect");
      newSocket.off("welcome");
      newSocket.close();
    };
  }, [serverUrl]);
  const authenticateAdmin = (adminData) => {
    if (socket && isConnected) {
      console.log("\u{1F451} Authenticating admin:", adminData);
      socket.emit("admin-login", adminData);
    } else {
      console.error("\u274C Cannot authenticate: Socket not connected");
      setConnectionError("Cannot authenticate: Not connected to server");
    }
  };
  const sendTestNotification = () => {
    if (socket && isConnected) {
      console.log("\u{1F9EA} Sending test notification");
      socket.emit("send-test-notification");
    } else {
      console.error("\u274C Cannot send test: Socket not connected");
      setConnectionError("Cannot send test: Not connected to server");
    }
  };
  const manualReconnect = () => {
    if (socket) {
      console.log("\u{1F504} Manual reconnection attempt...");
      setConnectionError("Attempting to reconnect...");
      socket.connect();
    }
  };
  return {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    authenticateAdmin,
    sendTestNotification,
    manualReconnect
  };
};
export {
  useWebSocket
};
