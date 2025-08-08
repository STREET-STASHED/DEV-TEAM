// components/CartIcon.tsx
import React from "react";
import { useCart } from "../context/CartContext";

export default function CartIcon() {
  const { toggleCart, items } = useCart();

  return (
    <div
      onClick={() => {
        toggleCart();
      }}
      className="relative p-2 cursor-pointer"
    >
      <span className="text-2xl">🛒</span>
      {items && items.length > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-bounce">
          {items.length}
        </span>
      )}
    </div>
  );
}
