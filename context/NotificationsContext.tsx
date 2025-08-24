'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { User } from "@supabase/supabase-js";

export interface Notification {
  id: string;
  type: 'order_update' | 'price_drop' | 'new_arrival' | 'sale' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  hydrated: boolean;
  markAsRead: (_id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (_id: string) => void;
  clearAll: () => void;
  toggleNotifications: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // const [user, setUser] = useState<User | null>(null);

  // For now, always treat as guest to avoid Supabase errors
  const isAuthenticated = false;

  // Load user session - disabled for now to avoid Supabase errors
  // useEffect(() => {
  //   const loadUserSession = async () => {
  //     try {
  //       const { data } = await supabase.auth.getSession();
  //       setUser(data?.session?.user ?? null);
  //     } catch (error) {
  //       console.error("Failed to load user session:", error);
  //       setUser(null);
  //     }
  //   };
    
  //   void loadUserSession();
  // }, []);

  // Set hydrated after mount
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch notifications - simplified for guest users
  const fetchNotifications = useCallback(async (): Promise<void> => {
    // For now, just show mock notifications for all users
    try {
      setNotifications([
        {
          id: '1',
          type: 'new_arrival',
          title: 'New Arrivals',
          message: 'Check out the latest streetwear drops!',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'price_drop',
          title: 'Price Drop Alert',
          message: 'Your wishlist items are now on sale!',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'order_update',
          title: 'Order Shipped',
          message: 'Your order #12345 has been shipped!',
          read: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        }
      ]);
    } catch (error) {
      console.error('Failed to set notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && hydrated) {
      void fetchNotifications();
    }
  }, [isAuthenticated, hydrated, fetchNotifications]);

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const markAsRead = async (id: string) => {
    // For now, just update local state for guest users
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    // For now, just update local state for guest users
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = async (id: string) => {
    // For now, just update local state for guest users
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    // For now, just update local state for guest users
    setNotifications([]);
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isOpen,
    hydrated,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    toggleNotifications,
    fetchNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
