"use client";
import React from "react";
import { useCart } from "../context/CartContext";

const CartDrawer: React.FC = () => {
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
  console.log("CartDrawer rendered. isOpen:", isOpen);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCart}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-black text-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Your Bag ({totalCount})</h2>
          <button
            onClick={toggleCart}
            className="text-3xl font-bold text-white"
          >
            &times;
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {items.length > 0 ? (
            <div className="space-y-6">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-gray-700 pb-4"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-gray-400">${item.price}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        className="px-2 py-1 border border-gray-600 text-white rounded"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="px-2 py-1 border border-gray-600 text-white rounded"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        className="ml-4 text-red-500 text-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <h3 className="text-md font-semibold mb-2">
                  Subtotal by Category
                </h3>
                {Object.entries(
                  items.reduce(
                    (acc, item) => {
                      const key = item.category || "Other";
                      acc[key] = (acc[key] || 0) + item.price * item.quantity;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([category, subtotal]) => (
                  <div
                    key={category}
                    className="flex justify-between text-sm text-gray-300"
                  >
                    <span>{category}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Your bag is empty.</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex justify-between items-center text-lg font-semibold mb-2">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-sm text-yellow-400">
            Delivery and platform fee bundled as one visible fee at checkout.
          </p>
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 mt-4 rounded"
            onClick={() => {
              toggleCart();
              window.location.href = "/buyer/checkout";
            }}
          >
            Checkout
          </button>
          <button
            className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded"
            onClick={() => (window.location.href = "/buyer/cart")}
          >
            View Bag
          </button>
          <button
            className="w-full mt-2 text-center text-blue-400 underline"
            onClick={toggleCart}
          >
            Continue Shopping
          </button>
          <button
            className="w-full mt-2 text-red-500 text-sm underline"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
