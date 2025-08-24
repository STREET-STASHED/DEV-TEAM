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

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  storeName: string;
  category?: string;
}

export interface WishlistContextType {
  items: WishlistItem[];
  totalCount: number;
  isOpen: boolean;
  hydrated: boolean;
  addItem: (_item: WishlistItem) => void;
  removeItem: (_id: string) => void;
  clearWishlist: () => void;
  toggleWishlist: () => void;
  hasItem: (_id: string) => boolean;
  syncToServer: (_items: WishlistItem[]) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "streetstashed_wishlist";

type GuestWishlistPayload = {
  items: WishlistItem[];
  timestamp: number;
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // const [user, setUser] = useState<User | null>(null);

  // For now, always treat as guest to avoid Supabase errors
  const isAuthenticated = false;

  // On mount, hydrate wishlist from localStorage for guests
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: GuestWishlistPayload = JSON.parse(stored);
          if (parsed?.items?.length > 0) {
            setItems(parsed.items);
          }
        }
      } catch (error) {
        console.error("Failed to parse guest wishlist from localStorage", error);
      }
      setHydrated(true);
    }
  }, []);

  // Save to localStorage for guests
  useEffect(() => {
    if (typeof window !== 'undefined' && hydrated) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ items, timestamp: Date.now() }),
        );
      } catch (error) {
        console.error("Failed to save guest wishlist to localStorage", error);
      }
    }
  }, [items, hydrated]);

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

  const syncToServer = useCallback(async (nextItems: WishlistItem[]): Promise<void> => {
    // For now, just save to localStorage for guest users
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items: nextItems, timestamp: Date.now() }),
      );
    } catch (error) {
      console.error("Failed to save wishlist to localStorage:", error);
    }
  }, []);

  // Sync to server when authenticated
  useEffect(() => {
    if (isAuthenticated && hydrated) {
      void syncToServer(items);
    }
  }, [items, isAuthenticated, hydrated, syncToServer]);

  const addItem = (item: WishlistItem) => {
    console.log("[WishlistContext] addItem", item);
    setItems((prev) => {
      const exists = prev.find((existingItem) => existingItem.id === item.id);
      if (exists) return prev; // Don't add duplicates
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    console.log("[WishlistContext] removeItem", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const toggleWishlist = () => {
    setIsOpen(!isOpen);
  };

  const hasItem = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const totalCount = items.length;

  const value: WishlistContextType = {
    items,
    totalCount,
    isOpen,
    hydrated,
    addItem,
    removeItem,
    clearWishlist,
    toggleWishlist,
    hasItem,
    syncToServer,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
