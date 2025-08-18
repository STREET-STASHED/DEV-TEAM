"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

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
  setIsOpen: (open: boolean) => void;
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
  // On mount, always hydrate cart from localStorage for guests.
  // This ensures cart state is always consistent, even if empty,
  // and avoids SSR/client mismatches on checkout.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: GuestCartPayload = JSON.parse(stored);
        if (parsed?.items?.length > 0) {
          setItems(parsed.items);
        }
      }
    } catch (error) {
      console.error("Failed to parse guest cart from localStorage", error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, timestamp: Date.now() }),
      );
    } catch (error) {
      console.error("Failed to save guest cart to localStorage", error);
    }
  }, [items]);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // "Stashed" service fee is determined at checkout; keep it out of CartItem shape
  const [stashedFee, setStashedFee] = useState<number>(0);

  const isAuthenticated = !!user;

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

  useEffect(() => {
    const loadCart = async () => {
      try {
        const guestItems = getGuestCart();

        if (isAuthenticated && user?.id) {
          const { data: serverRows } = await supabase
            .from("cart_items")
            .select("*")
            .eq("user_id", user.id);

          // Map DB rows -> client CartItem (image -> image_url)
          const serverItems: CartItem[] = (serverRows ?? []).map(
            (row: { image: string | null; id: string; name: string; price: number; quantity: number; [key: string]: unknown }) => ({
              id: row.id,
              name: row.name,
              price: row.price,
              quantity: row.quantity,
              image_url: row.image ?? "/mock/default-product.jpg",
              category: (row.category as string) ?? "general",
              delivery_tier: (row.delivery_tier as string) ?? "standard",
            }),
          );

          const mergedItems = mergeItems(serverItems ?? [], guestItems ?? []);
          setItems(mergedItems);

          // Map client -> DB and upsert with composite conflict target
          await supabase.from("cart_items").upsert(
            mergedItems.map((item) => ({
              ...item,
              image: item.image_url ?? null,
              user_id: user.id,
            })),
            { onConflict: "user_id,id" },
          );

          clearGuestCart();
        } else if (guestItems.length > 0) {
          setItems(guestItems);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        // Fallback to guest cart on error
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          setItems(guestItems);
        }
      }
    };

    void loadCart();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) saveGuestCart(items);
  }, [items, isAuthenticated]);

  const syncToServer = async (nextItems: CartItem[]): Promise<void> => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      await supabase.from("cart_items").upsert(
        nextItems.map((item) => ({
          ...item,
          image: item.image_url ?? null,
          user_id: user.id,
        })),
        { onConflict: "user_id,id" },
      );
    } catch (error) {
      console.error("Failed to sync cart to server:", error);
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

  const clearCart = async () => {
    setItems([]);
    if (isAuthenticated && user?.id) {
      try {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const clearCartSync = () => {
    setItems([]);
    if (isAuthenticated && user?.id) {
      void clearCart();
    }
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: GuestCartPayload = JSON.parse(stored);
    const expired = Date.now() - parsed.timestamp > EXPIRY_MS;
    return expired ? [] : parsed.items;
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ items, timestamp: Date.now() }),
  );
}

function clearGuestCart() {
  localStorage.removeItem(STORAGE_KEY);
}

function mergeItems(
  serverItems: CartItem[],
  guestItems: CartItem[],
): CartItem[] {
  const map = new Map<string, CartItem>();
  [...serverItems, ...guestItems].forEach((item) => {
    const existing = map.get(item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      map.set(item.id, { ...item });
    }
  });
  return Array.from(map.values());
}
