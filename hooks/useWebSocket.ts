import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { WebSocketEvents } from "../lib/websocket";

interface UseWebSocketOptions {
  userId: string;
  userType: "driver" | "buyer" | "seller" | "admin";
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribeToOrder: (orderId: string) => void;
  unsubscribeFromOrder: (orderId: string) => void;
  sendDriverLocation: (location: { lat: number; lng: number }) => void;
  sendDriverStatusUpdate: (orderId: string, status: string) => void;
  sendChatMessage: (to: string, message: string) => void;
  sendDriverOnlineStatus: (isOnline: boolean) => void;
}

export const useWebSocket = ({
  userId,
  userType,
  autoConnect = true,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3000",
      {
        transports: ["websocket", "polling"],
        autoConnect: false,
        query: {
          userId,
          userType,
        },
      },
    );

    // Connection events
    newSocket.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Authenticate with the server
      newSocket.emit("authenticate", { userId, userType });

      onConnect?.();
    });

    newSocket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      setIsConnected(false);
      onDisconnect?.();

      // Attempt to reconnect if not manually disconnected
      if (
        reason !== "io client disconnect" &&
        reconnectAttempts.current < maxReconnectAttempts
      ) {
        reconnectTimeoutRef.current = setTimeout(
          () => {
            reconnectAttempts.current++;
            console.log(
              `Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`,
            );
            newSocket.connect();
          },
          Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000),
        ); // Exponential backoff, max 30s
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      onError?.(error);
    });

    // Authentication response
    newSocket.on("authenticated", (data) => {
      if (data.success) {
        console.log("WebSocket authenticated successfully");
      } else {
        console.error("WebSocket authentication failed");
      }
    });

    // Order events
    newSocket.on(
      "order:status_change",
      (data: WebSocketEvents["order:status_change"]) => {
        console.log("Order status changed:", data);
        // You can emit a custom event or use a callback here
        window.dispatchEvent(
          new CustomEvent("order:status_change", { detail: data }),
        );
      },
    );

    newSocket.on(
      "order:assigned",
      (data: WebSocketEvents["order:assigned"]) => {
        console.log("Order assigned to driver:", data);
        window.dispatchEvent(
          new CustomEvent("order:assigned", { detail: data }),
        );
      },
    );

    // Location updates
    newSocket.on(
      "location:driver_update",
      (data: WebSocketEvents["location:driver_update"]) => {
        console.log("Driver location updated:", data);
        window.dispatchEvent(
          new CustomEvent("location:driver_update", { detail: data }),
        );
      },
    );

    // Chat messages
    newSocket.on("chat:message", (data: WebSocketEvents["chat:message"]) => {
      console.log("Chat message received:", data);
      window.dispatchEvent(new CustomEvent("chat:message", { detail: data }));
    });

    newSocket.on(
      "chat:message:sent",
      (data: WebSocketEvents["chat:message"]) => {
        console.log("Chat message sent successfully:", data);
        window.dispatchEvent(
          new CustomEvent("chat:message:sent", { detail: data }),
        );
      },
    );

    // System notifications
    newSocket.on(
      "system:notification",
      (data: WebSocketEvents["system:notification"]) => {
        console.log("System notification received:", data);
        window.dispatchEvent(
          new CustomEvent("system:notification", { detail: data }),
        );
      },
    );

    socketRef.current = newSocket;
    setSocket(newSocket);

    return newSocket;
  }, [userId, userType, onConnect, onDisconnect, onError]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!socketRef.current) {
      initializeSocket();
    }
    socketRef.current?.connect();
  }, [initializeSocket]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    socketRef.current?.disconnect();
  }, []);

  // Subscribe to order updates
  const subscribeToOrder = useCallback((orderId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe:order", orderId);
    }
  }, []);

  // Unsubscribe from order updates
  const unsubscribeFromOrder = useCallback((orderId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("unsubscribe:order", orderId);
    }
  }, []);

  // Send driver location update
  const sendDriverLocation = useCallback(
    (location: { lat: number; lng: number }) => {
      if (socketRef.current?.connected && userType === "driver") {
        socketRef.current.emit("driver:location_update", {
          driverId: userId,
          location,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId, userType],
  );

  // Send driver status update
  const sendDriverStatusUpdate = useCallback(
    (orderId: string, status: string) => {
      if (socketRef.current?.connected && userType === "driver") {
        socketRef.current.emit("driver:status_update", {
          driverId: userId,
          orderId,
          status,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId, userType],
  );

  // Send chat message
  const sendChatMessage = useCallback(
    (to: string, message: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("chat:message", {
          from: userId,
          to,
          message,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId],
  );

  // Send driver online status
  const sendDriverOnlineStatus = useCallback(
    (isOnline: boolean) => {
      if (socketRef.current?.connected && userType === "driver") {
        socketRef.current.emit("driver:online_status", {
          driverId: userId,
          isOnline,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId, userType],
  );

  // Initialize on mount
  useEffect(() => {
    if (autoConnect) {
      initializeSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [autoConnect, initializeSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    subscribeToOrder,
    unsubscribeFromOrder,
    sendDriverLocation,
    sendDriverStatusUpdate,
    sendChatMessage,
    sendDriverOnlineStatus,
  };
};

// Hook for listening to WebSocket events
export const useWebSocketEvents = <T>(
  eventName: string,
  callback: (data: T) => void,
  deps: React.DependencyList = [],
) => {
  useEffect(() => {
    const handleEvent = (event: CustomEvent<T>) => {
      callback(event.detail);
    };

    window.addEventListener(eventName, handleEvent as EventListener);

    return () => {
      window.removeEventListener(eventName, handleEvent as EventListener);
    };
  }, [eventName, callback, deps]);
};
