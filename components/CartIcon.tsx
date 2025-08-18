// components/CartIcon.tsx
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import CartBadge from "./CartBadge";

export default function CartIcon() {
  const { toggleCart, items } = useCart();
  const [showBadge, setShowBadge] = useState(false);

  // Show badge animation when items change
  useEffect(() => {
    if (items && items.length > 0) {
      setShowBadge(true);
      const timer = setTimeout(() => setShowBadge(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [items]);

  return (
    <div
      onClick={() => {
        toggleCart();
      }}
      className="relative p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
    >
      <span className="text-2xl">🛒</span>
      <CartBadge count={items?.length || 0} isVisible={showBadge} />
    </div>
  );
}
