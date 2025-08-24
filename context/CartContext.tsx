'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
// Only import supabase when needed for authenticated users
// import { supabase } from "@/lib/supabaseClient";
// import { User } from "@supabase/supabase-js";
import { safeJsonParse } from "@/lib/safeJson";
import { computeStashedSupportFee } from '@/lib/feeConfig';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  /** Optional: keep for backward-compat; fee is computed at checkout */
  category?: string;
  delivery_tier?: string;
}

export interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[];
  totalCount: number;
  totalPrice: number;
  totalAmount: number;
  isOpen: boolean;
  hydrated: boolean;
  stashedFee: number;
  setStashedFee: (_fee: number) => void;
  addItem: (_item: CartItem, _quantity?: number) => void;
  updateQuantity: (_id: string, _quantity: number) => void;
  removeItem: (_id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  hasItem: (_id: string) => boolean;
  setIsOpen: (_open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "guestCart";
const EXPIRY_MS = 7 * 86400 * 1000;

type GuestCartPayload = {
  items: CartItem[];
  timestamp: number;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [stashedFee, setStashedFee] = useState<number>(0);

  // For now, always treat as guest user to avoid Supabase errors
  const isAuthenticated = false;

  // On mount, always hydrate cart from localStorage for guests.
  // This ensures cart state is always consistent, even if empty,
  // and avoids SSR/client mismatches on checkout.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: GuestCartPayload = safeJsonParse(stored, { items: [], timestamp: 0 });
          if (parsed?.items?.length > 0) {
            setItems(parsed.items);
          }
        }
      } catch (error) {
        console.error("Failed to parse guest cart from localStorage", error);
      }
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && hydrated) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ items, timestamp: Date.now() }),
        );
      } catch (error) {
        console.error("Failed to save guest cart to localStorage", error);
      }
    }
  }, [items, hydrated]);

  // For now, disable user session loading to avoid Supabase errors
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

  useEffect(() => {
    if (!hydrated) return;
    
    // Simplified cart loading - only use guest cart for now
    const loadCart = () => {
      try {
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          setItems(guestItems);
        }
      } catch (error) {
        console.error("Failed to load guest cart:", error);
      }
    };

    loadCart();
  }, [hydrated]);

  useEffect(() => {
    if (!isAuthenticated && hydrated) saveGuestCart(items);
  }, [items, isAuthenticated, hydrated]);

  // Simplified server sync - disabled for now to avoid Supabase errors
  const syncToServer = async (nextItems: CartItem[]): Promise<void> => {
    // For now, just save to localStorage
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items: nextItems, timestamp: Date.now() }),
      );
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  };

  const addItem = (item: CartItem, quantity = 1) => {
    console.log("[CartContext] addItem", item, quantity);
    const withDefaults: CartItem = {
      ...item,
      quantity,
      category: item.category ?? "general",
      delivery_tier: item.delivery_tier ?? "standard",
    };

    setItems((prev) => {
      const exists = prev.find(
        (existingItem) => existingItem.id === withDefaults.id,
      );
      const next = exists
        ? prev.map((existingItem) =>
            existingItem.id === withDefaults.id
              ? { ...existingItem, quantity: existingItem.quantity + quantity }
              : existingItem,
          )
        : [...prev, withDefaults];
      
      // Handle promise properly
      void syncToServer(next);
      return next;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    console.log("[CartContext] updateQuantity", id, quantity);
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
      );
      
      // Handle promise properly
      void syncToServer(next);
      return next;
    });
  };

  const removeItem = (id: string) => {
    console.log("[CartContext] removeItem", id);
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      syncToServer(next).catch(console.error);
      return next;
    });
  };

  // const clearCart = async () => {
  //   setItems([]);
  //   // For now, just clear local storage to avoid Supabase errors
  //   clearGuestCart();
  // };

  const clearCartSync = () => {
    setItems([]);
    // For now, just clear local storage to avoid Supabase errors
    clearGuestCart();
  };

  const toggleCart = () => setIsOpen((prev) => !prev);

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items],
  );

  // Calculate Stashed Support Fee automatically when items change
  const calculatedStashedFee = useMemo(() => {
    if (items.length === 0) return 0;
    
    // Use default distance for cart preview (will be recalculated at checkout with actual address)
    const defaultDistanceMiles = 8.0;
    const currentHour = new Date().getHours();
    
          try {
        const feeBreakdown = computeStashedSupportFee({
          distanceMiles: defaultDistanceMiles,
          cartSubtotal: totalPrice,
          localHour: currentHour
        });
        return feeBreakdown.buyer;
    } catch (error) {
      console.error("Failed to calculate Stashed Support Fee:", error);
      return 0;
    }
  }, [items.length, totalPrice]);

  // Update stashedFee when calculated fee changes
  useEffect(() => {
    setStashedFee(calculatedStashedFee);
  }, [calculatedStashedFee]);

  const totalAmount = useMemo(
    () => totalPrice + stashedFee,
    [totalPrice, stashedFee],
  );
  const hasItem = (id: string) => {
    return items.some((item) => item.id === id);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items,
        totalCount,
        totalPrice,
        totalAmount,
        isOpen,
        hydrated,
        stashedFee,
        setStashedFee,
        addItem,
        updateQuantity,
        removeItem,
        clearCart: clearCartSync,
        toggleCart,
        hasItem,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

function getGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: GuestCartPayload = safeJsonParse(stored, { items: [], timestamp: 0 });
    const expired = Date.now() - parsed.timestamp > EXPIRY_MS;
    return expired ? [] : parsed.items;
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ items, timestamp: Date.now() }),
  );
}

function clearGuestCart() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEY);
}

// function mergeItems(
//   serverItems: CartItem[],
//   guestItems: CartItem[],
// ): CartItem[] {
//   const map = new Map<string, CartItem>();
//   [...serverItems, ...guestItems].forEach((item) => {
//     const existing = map.get(item.id);
//     if (existing) {
//       existing.quantity += item.quantity;
//     } else {
//       map.set(item.id, { ...item });
//     }
//   });
//   return Array.from(map.values());
// }
