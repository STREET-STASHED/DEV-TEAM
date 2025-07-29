// components/CartIcon.tsx
import React from "react";
import { useCart } from "../context/CartContext";

export default function CartIcon() {
  const { toggleCart, cartItems } = useCart();
  // calculate total item count
  const itemCount =
    cartItems?.reduce?.((sum, item) => sum + (item.quantity || 1), 0) || 0;
  return (
    <button
      onClick={toggleCart}
      style={{
        position: "relative",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
      aria-label="Open cart"
    >
      <svg
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M7 4h-2l-3 9h2l2-6h14l1 6h2l-1-9h-17zm0 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
      {itemCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "red",
            color: "white",
            borderRadius: "50%",
            minWidth: 18,
            height: 18,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 5px",
            fontWeight: "bold",
            transform: "translate(35%,-35%)",
          }}
          aria-label={`${itemCount} items in cart`}
        >
          {itemCount}
        </span>
      )}
    </button>
  );
}
