'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!user;

  // Load user session
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data?.session?.user ?? null);
      } catch (error) {
        console.error("Failed to load user session:", error);
        setUser(null);
      }
    };
    
    void loadUserSession();
  }, []);

  // Set hydrated after mount
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && hydrated) {
      void fetchNotifications();
    }
  }, [isAuthenticated, hydrated]);

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const fetchNotifications = async (): Promise<void> => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Fallback to mock notifications for demo
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
    }
  };

  const markAsRead = async (id: string) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );

      // Update server
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );

      // Update server
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const removeNotification = async (id: string) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      // Update local state immediately
      setNotifications(prev => prev.filter(n => n.id !== id));

      // Update server
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error("Failed to remove notification:", error);
    }
  };

  const clearAll = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      // Update local state immediately
      setNotifications([]);

      // Update server
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
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
