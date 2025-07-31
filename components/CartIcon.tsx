// components/CartIcon.tsx
import React from "react";
import { useCart } from "../context/CartContext";

export default function CartIcon() {
  console.log("CartIcon rendered");
  return (
    <button
      onClick={() => {
        const { toggleCart } = useCart();
        console.log("Cart button clicked");
        toggleCart();
      }}
      className="p-2"
    >
      🛒
    </button>
  );
}
