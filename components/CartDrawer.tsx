"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  store_id?: string;
}

export interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prevItems, item];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((it) =>
        it.id === id ? { ...it, quantity: Math.max(quantity, 1) } : it,
      ),
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((it) => it.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsOpen((prev) => !prev);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        totalPrice,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      totalCount: 0,
      totalPrice: 0,
      addItem: () => {},
      updateQuantity: () => {},
      removeItem: () => {},
      clearCart: () => {},
      isOpen: false,
      toggleCart: () => {},
    };
  }
  return context;
};

interface CartDrawerProps {
  onClose?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onClose }) => {
  const {
    items,
    totalCount,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
    isOpen,
    toggleCart,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose || toggleCart}
      />
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col p-4 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          className="self-end mb-4 text-gray-700 hover:text-gray-900"
          onClick={onClose || toggleCart}
        >
          Close
        </button>
        <h2 className="text-xl font-semibold mb-4">
          Your Cart ({totalCount} items)
        </h2>
        <ul className="flex-grow overflow-auto">
          {items.map((item) => (
            <li key={item.id} className="mb-3">
              <div className="flex justify-between items-center">
                <div>
                  {item.name} - ${item.price} x {item.quantity}
                </div>
                <div className="space-x-1">
                  <button
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 font-semibold">Total: ${totalPrice}</div>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>
    </>
  );
};

export default CartDrawer;
