"use client";
import React from "react";
import { useCart } from "../context/CartContext";

const CartDrawer: React.FC = () => {
  console.log("CartDrawer rendered");
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
  console.log("isOpen:", isOpen);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={toggleCart}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-black text-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-yellow-400 bg-black">
          <h2 className="text-xl font-bold text-yellow-400">Your Cart ({totalCount} items)</h2>
          <button
            onClick={toggleCart}
            className="bg-yellow-400 text-black font-bold px-3 py-1 rounded hover:bg-yellow-300"
          >
            Close
          </button>
        </div>

        <ul className="flex-grow overflow-auto p-4">
          {items.map((item) => (
            <li key={item.id} className="mb-3">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-400">${item.price} x {item.quantity}</p>
                </div>
                <div className="space-x-1">
                  <button
                    className="px-2 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="px-2 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="p-4 border-t border-yellow-400 bg-black flex justify-between items-center">
          <span className="text-lg">Total:</span>
          <span className="text-xl font-bold text-yellow-400">${totalPrice}</span>
        </div>

        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-b"
          onClick={clearCart}
        >
          Clear Cart
        </button>
        <button
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3"
          onClick={() => {
            toggleCart(); // close drawer
            window.location.href = "/buyer/checkout"; // go to checkout
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </>
  );
};

export default CartDrawer;
