"use client";
// context/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  store_id?: string;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevItems, item];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(quantity, 1) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalCount, totalPrice, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Minimal CartDrawer component

interface CartDrawerProps {
  onClose?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onClose }) => {
  let cart;
  try {
    cart = useCart();
  } catch {
    return null;
  }
  const { items, totalCount, totalPrice, updateQuantity, removeItem, clearCart } = cart;

  return (
    <div>
      {onClose && <button onClick={onClose}>Close</button>}
      <h2>Your Cart ({totalCount} items)</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <div>Total: ${totalPrice}</div>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
};

export default CartDrawer;