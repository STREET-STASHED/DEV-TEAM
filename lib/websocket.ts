import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { pushService } from "./push";

export interface WebSocketEvents {
  // Driver events
  "driver:location_update": {
    driverId: string;
    location: { lat: number; lng: number };
    timestamp: string;
  };

  "driver:status_update": {
    driverId: string;
    orderId: string;
    status: string;
    timestamp: string;
  };

  "driver:online_status": {
    driverId: string;
    isOnline: boolean;
    timestamp: string;
  };

  // Order events
  "order:status_change": {
    orderId: string;
    status: string;
    driverId?: string;
    timestamp: string;
  };

  "order:assigned": {
    orderId: string;
    driverId: string;
    driverName: string;
    estimatedArrival: string;
    timestamp: string;
  };

  "order:delivered": {
    orderId: string;
    driverId: string;
    timestamp: string;
  };

  // Location tracking
  "location:driver_update": {
    driverId: string;
    orderId: string;
    location: { lat: number; lng: number };
    heading: number;
    speed: number;
    timestamp: string;
  };

  // Chat/Communication
  "chat:message": {
    from: string;
    to: string;
    message: string;
    timestamp: string;
  };

  // System notifications
  "system:notification": {
    userId: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    timestamp: string;
  };
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private driverSockets: Map<string, string> = new Map(); // driverId -> socketId
  private orderSubscriptions: Map<string, Set<string>> = new Map(); // orderId -> Set of socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // User authentication
      socket.on(
        "authenticate",
        (data: {
          userId: string;
          userType: "driver" | "buyer" | "seller" | "admin";
        }) => {
          this.handleAuthentication(socket, data);
        },
      );

      // Subscribe to order updates
      socket.on("subscribe:order", (orderId: string) => {
        this.subscribeToOrder(socket.id, orderId);
      });

      // Unsubscribe from order updates
      socket.on("unsubscribe:order", (orderId: string) => {
        this.unsubscribeFromOrder(socket.id, orderId);
      });

      // Driver location updates
      socket.on(
        "driver:location_update",
        (data: WebSocketEvents["driver:location_update"]) => {
          this.handleDriverLocationUpdate(socket, data);
        },
      );

      // Driver status updates
      socket.on(
        "driver:status_update",
        (data: WebSocketEvents["driver:status_update"]) => {
          this.handleDriverStatusUpdate(socket, data);
        },
      );

      // Chat messages
      socket.on("chat:message", (data: WebSocketEvents["chat:message"]) => {
        this.handleChatMessage(socket, data);
      });

      // Disconnect handling
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleAuthentication(
    socket: { id: string; join: (_room: string) => void; emit: (_event: string, _data: unknown) => void },
    data: { userId: string; userType: string },
  ) {
    const { userId, userType } = data;

    // Store user connection
    this.connectedUsers.set(userId, socket.id);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // If driver, also join driver room
    if (userType === "driver") {
      this.driverSockets.set(userId, socket.id);
      socket.join(`driver:${userId}`);
    }

    console.log(`User ${userId} (${userType}) authenticated on socket ${socket.id}`);
  }

  private subscribeToOrder(socketId: string, orderId: string) {
    if (!this.orderSubscriptions.has(orderId)) {
      this.orderSubscriptions.set(orderId, new Set());
    }
    this.orderSubscriptions.get(orderId)!.add(socketId);
    console.log(`Socket ${socketId} subscribed to order ${orderId}`);
  }

  private unsubscribeFromOrder(socketId: string, orderId: string) {
    const subscriptions = this.orderSubscriptions.get(orderId);
    if (subscriptions) {
      subscriptions.delete(socketId);
      if (subscriptions.size === 0) {
        this.orderSubscriptions.delete(orderId);
      }
    }
    console.log(`Socket ${socketId} unsubscribed from order ${orderId}`);
  }

  private handleDriverLocationUpdate(
    socket: { id: string },
    data: WebSocketEvents["driver:location_update"],
  ) {
    // Broadcast to all users tracking this driver's orders
    this.io.to(`driver:${data.driverId}`).emit("location:driver_update", {
      ...data,
      timestamp: new Date().toISOString(),
    });

    console.log(`Driver ${data.driverId} location updated:`, data.location);
  }

  private handleDriverStatusUpdate(
    socket: { id: string },
    data: WebSocketEvents["driver:status_update"],
  ) {
    // Broadcast order status change to all subscribers
    const orderSubscriptions = this.orderSubscriptions.get(data.orderId);
    if (orderSubscriptions) {
      this.io.to(Array.from(orderSubscriptions)).emit("order:status_change", {
        orderId: data.orderId,
        status: data.status,
        driverId: data.driverId,
        timestamp: new Date().toISOString(),
      });
    }

    // Send push notification for important status changes
    if (["picked_up", "in_transit", "delivered"].includes(data.status)) {
      this.sendOrderStatusPushNotification(data.orderId, data.status, data.driverId);
    }

    console.log(`Driver ${data.driverId} updated order ${data.orderId} to ${data.status}`);
  }

  private handleChatMessage(
    socket: { id: string },
    data: WebSocketEvents["chat:message"],
  ) {
    // Send message to recipient
    this.io.to(`user:${data.to}`).emit("chat:message", {
      ...data,
      timestamp: new Date().toISOString(),
    });

    // Send push notification for chat messages
    this.sendChatPushNotification(data.to, data.from, data.message);
  }

  private handleDisconnect(socket: { id: string }) {
    // Remove from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === socket.id) {
        this.connectedUsers.delete(userId);

        // If driver, remove from driver sockets
        if (this.driverSockets.has(userId)) {
          this.driverSockets.delete(userId);
        }
        break;
      }
    }

    // Remove from order subscriptions
    for (const [orderId, subscriptions] of this.orderSubscriptions.entries()) {
      subscriptions.delete(socket.id);
      if (subscriptions.size === 0) {
        this.orderSubscriptions.delete(orderId);
      }
    }

    console.log(`Socket ${socket.id} disconnected`);
  }

  // Public methods for external use
  public broadcastOrderStatusChange(orderId: string, status: string, driverId?: string) {
    const eventData: WebSocketEvents["order:status_change"] = {
      orderId,
      status,
      driverId,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to order subscribers
    const orderSubscriptions = this.orderSubscriptions.get(orderId);
    if (orderSubscriptions) {
      this.io.to(Array.from(orderSubscriptions)).emit("order:status_change", eventData);
    }

    // Send push notification
    this.sendOrderStatusPushNotification(orderId, status, driverId);
  }

  public broadcastDriverLocation(driverId: string, location: { lat: number; lng: number }) {
    const eventData: WebSocketEvents["location:driver_update"] = {
      driverId,
      orderId: "", // Will be filled by client
      location,
      heading: 0,
      speed: 0,
      timestamp: new Date().toISOString(),
    };

    this.io.to(`driver:${driverId}`).emit("location:driver_update", eventData);
  }

  public sendSystemNotification(userId: string, type: "info" | "success" | "warning" | "error", title: string, message: string) {
    const eventData: WebSocketEvents["system:notification"] = {
      userId,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
    };

    this.io.to(`user:${userId}`).emit("system:notification", eventData);

    // Send push notification
    this.sendSystemPushNotification(userId, type, title, message);
  }

  private async sendOrderStatusPushNotification(orderId: string, status: string, driverId?: string) {
    try {
      // Get order details and send push notification
      // This would integrate with your notification service
      await pushService.sendToUser(orderId, {
        title: `Order Update: ${status.replace('_', ' ').toUpperCase()}`,
        message: `Your order status has been updated to ${status}`,
        data: { orderId, status, driverId: driverId || '' },
      });
    } catch (error) {
      console.error("Failed to send order status push notification:", error);
    }
  }

  private async sendChatPushNotification(toUserId: string, fromUserId: string, message: string) {
    try {
      await pushService.sendToUser(toUserId, {
        title: "New Message",
        message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
        data: { fromUserId, message },
      });
    } catch (error) {
      console.error("Failed to send chat push notification:", error);
    }
  }

  private async sendSystemPushNotification(userId: string, type: string, title: string, message: string) {
    try {
      await pushService.sendToUser(userId, {
        title,
        message,
        data: { type, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      console.error("Failed to send system push notification:", error);
    }
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getConnectedDriversCount(): number {
    return this.driverSockets.size;
  }

  public getOrderSubscribersCount(orderId: string): number {
    return this.orderSubscriptions.get(orderId)?.size || 0;
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null;

export const initializeWebSocketServer = (
  server: HTTPServer,
): WebSocketServer => {
  if (!wsServer) {
    wsServer = new WebSocketServer(server);
  }
  return wsServer;
};

export const getWebSocketServer = (): WebSocketServer | null => {
  return wsServer;
};
