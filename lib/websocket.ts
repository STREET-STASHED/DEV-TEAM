import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

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
    this.connectedUsers.set(data.userId, socket.id);

    if (data.userType === "driver") {
      this.driverSockets.set(data.userId, socket.id);
      socket.join(`driver:${data.userId}`);
    }

    socket.join(`user:${data.userId}`);
    socket.emit("authenticated", { success: true });

    console.log(`User ${data.userId} authenticated as ${data.userType}`);
  }

  private subscribeToOrder(socketId: string, orderId: string) {
    if (!this.orderSubscriptions.has(orderId)) {
      this.orderSubscriptions.set(orderId, new Set());
    }
    this.orderSubscriptions.get(orderId)!.add(socketId);
    console.log(`Socket ${socketId} subscribed to order ${orderId}`);
  }

  private unsubscribeFromOrder(socketId: string, orderId: string) {
    const subscribers = this.orderSubscriptions.get(orderId);
    if (subscribers) {
      subscribers.delete(socketId);
      if (subscribers.size === 0) {
        this.orderSubscriptions.delete(orderId);
      }
    }
    console.log(`Socket ${socketId} unsubscribed from order ${orderId}`);
  }

  private handleDriverLocationUpdate(
    _socket: { id: string },
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
    _socket: { id: string },
    data: WebSocketEvents["driver:status_update"],
  ) {
    // Broadcast order status change to all subscribers
    const subscribers = this.orderSubscriptions.get(data.orderId);
    if (subscribers) {
      subscribers.forEach((socketId) => {
        this.io.to(socketId).emit("order:status_change", {
          ...data,
          timestamp: new Date().toISOString(),
        });
      });
    }

    console.log(`Order ${data.orderId} status updated to ${data.status}`);
  }

  private handleChatMessage(
    socket: { id: string; emit: (_event: string, _data: unknown) => void },
    data: WebSocketEvents["chat:message"],
  ) {
    // Send message to specific user
    const targetSocketId = this.connectedUsers.get(data.to);
    if (targetSocketId) {
      this.io.to(targetSocketId).emit("chat:message", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }

    // Also send back to sender for confirmation
    socket.emit("chat:message:sent", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  private handleDisconnect(socket: { id: string }) {
    // Remove from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === socket.id) {
        this.connectedUsers.delete(userId);

        // Remove from driver sockets if applicable
        if (this.driverSockets.has(userId)) {
          this.driverSockets.delete(userId);
        }

        // Remove from all order subscriptions
        for (const [
          orderId,
          subscribers,
        ] of this.orderSubscriptions.entries()) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.orderSubscriptions.delete(orderId);
          }
        }

        break;
      }
    }

    console.log(`User disconnected: ${socket.id}`);
  }

  // Public methods for broadcasting events
  public broadcastOrderStatusChange(
    orderId: string,
    status: string,
    driverId?: string,
  ) {
    const event: WebSocketEvents["order:status_change"] = {
      orderId,
      status,
      driverId,
      timestamp: new Date().toISOString(),
    };

    this.io.emit("order:status_change", event);
  }

  public broadcastOrderAssigned(
    orderId: string,
    driverId: string,
    driverName: string,
    estimatedArrival: string,
  ) {
    const event: WebSocketEvents["order:assigned"] = {
      orderId,
      driverId,
      driverName,
      estimatedArrival,
      timestamp: new Date().toISOString(),
    };

    this.io.emit("order:assigned", event);
  }

  public sendNotificationToUser(
    userId: string,
    notification: Omit<
      WebSocketEvents["system:notification"],
      "userId" | "timestamp"
    >,
  ) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const event: WebSocketEvents["system:notification"] = {
        userId,
        ...notification,
        timestamp: new Date().toISOString(),
      };

      this.io.to(socketId).emit("system:notification", event);
    }
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getDriverCount(): number {
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
