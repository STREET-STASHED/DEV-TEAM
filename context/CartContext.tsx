import { createContext, useContext, useState, ReactNode } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

export type CartItem = Product & { quantity: number };

export type CartContextType = {
  cart: CartItem[];
  cartItems: CartItem[]; // Alias for compatibility
  addToCart: (product: Product) => void;
  addItem: (product: Product) => void; // Add alias
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart,
        addToCart,
        addItem: addToCart,
        removeFromCart,
        updateQuantity,
        decreaseQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
      }}
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