// context/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  /**
   * Add an item to the cart with a specified quantity.
   * If the product already exists, increment its quantity by the new item's quantity.
   * Supports adding from any store or product grid by ensuring unique product ids.
   */
  addItem: (item: CartItem) => void;
  /**
   * Remove an item from the cart by productId.
   * Enables removal from any UI such as modals or checkout.
   */
  removeItem: (productId: string) => void;
  /**
   * Update the quantity of a specific cart item.
   * Enforces minimum quantity of 1 to avoid invalid states.
   * Useful for quantity selectors in product grids or cart details.
   */
  updateQuantity: (productId: string, quantity: number) => void;
  /**
   * Clear all items from the cart.
   */
  clearCart: () => void;
  /**
   * Retrieve a cart item by productId.
   * Useful for detail views or modals that require item info.
   */
  getItem: (productId: string) => CartItem | undefined;
  /**
   * Check if a product is already in the cart.
   * Useful for UI feedback such as "Added!" badges.
   */
  hasItem: (productId: string) => boolean;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      // Add new product with specified quantity (default to 1 if missing)
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(prev =>
      prev.map(i =>
        i.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItem = (productId: string): CartItem | undefined => {
    return items.find(i => i.id === productId);
  };

  const hasItem = (productId: string): boolean => {
    return items.some(i => i.id === productId);
  };

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItem,
        hasItem,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * Custom hook to access cart context.
 * If used outside CartProvider, returns a fallback context (noops) instead of throwing.
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    // Fallback noop context for SSR/prerender or unwrapped components
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getItem: () => undefined,
      hasItem: () => false,
      totalCount: 0,
      totalPrice: 0,
    };
  }
  return context;
};