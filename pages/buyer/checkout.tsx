import haversine from "haversine-distance";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { calculateStashedSupportFee } from "@/lib/fees";
import { CartItem } from "@/types/cart";

// Disable static generation to prevent context issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function Checkout() {
  const cart = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [tip, setTip] = useState(0);
  const [fakeDistance, setFakeDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");

  // All hooks must be called at the top level, before any conditional returns
  const { items, totalAmount, stashedFee, setStashedFee } = cart;

  // Subtotal (without fee or tip)
  const subtotal = useMemo(
    () =>
      (items ?? []).reduce(
        (sum: number, it: CartItem) => sum + (it.price || 0) * (it.quantity ?? 1),
        0,
      ),
    [items],
  );

  // Helper: recompute the stashed fee from distance + subtotal
  const recomputeFee = useCallback(
    (distanceMiles: number) => {
      const { buyerFee } = calculateStashedSupportFee({
        distance: distanceMiles,
        orderTotal: subtotal,
      });
      setStashedFee(buyerFee);
    },
    [subtotal, setStashedFee],
  );

  useEffect(() => {
    const buyerCoords = { lat: 40.4406, lng: -79.9959 }; // Replace with dynamic geolocation later
    const storeCoords = { lat: 40.456, lng: -79.9801 }; // Example coordinates; replace with actual seller/store coords

    const distance = haversine(buyerCoords, storeCoords) / 1609; // convert meters to miles
    const rounded = Math.round(distance * 10) / 10;
    setFakeDistance(rounded);

    if (distance <= 2) setEstimatedTime("25–35 min");
    else if (distance <= 5) setEstimatedTime("35–55 min");
    else if (distance <= 8) setEstimatedTime("55–70 min");
    else setEstimatedTime("70–90 min");

    // Seed fee on initial mount
    recomputeFee(rounded);
  }, [recomputeFee]);

  // Keep fee in sync when items or distance change
  useEffect(() => {
    recomputeFee(fakeDistance);
  }, [fakeDistance, items, recomputeFee]);

  if (!cart) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white text-black dark:bg-black dark:text-white rounded shadow">
        <p>Loading cart...</p>
      </div>
    );
  }

  // Fee displayed comes from context; totalAmount already includes stashedFee
  const supportFee = stashedFee ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation handled by HTML attributes

    const orderPayload = {
      name,
      address,
      email,
      items,
      subtotal,
      supportFee,
      totalAmount, // subtotal + stashedFee
      tip,
      grandTotal: (totalAmount ?? 0) + tip,
      distanceMiles: fakeDistance,
      eta: estimatedTime,
    };
    console.log("Submitting order:", orderPayload);
    alert("Order submitted successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white text-black dark:bg-black dark:text-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Review and Checkout</h2>

      <div className="space-y-4 border-b pb-4">
        {items?.map((item: CartItem) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.name} x{item.quantity ?? 1}
            </span>
            <span>${(item.price * (item.quantity ?? 1)).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Support Fee:</span>
          <span>${supportFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tip:</span>
          <span>${tip.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${((totalAmount ?? 0) + tip).toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Delivery Address
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="tip" className="block text-sm font-medium mb-1">
            Tip (Optional)
          </label>
          <select
            id="tip"
            value={tip}
            onChange={(e) => setTip(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>No tip</option>
            <option value={2}>$2</option>
            <option value={5}>$5</option>
            <option value={10}>$10</option>
            <option value={15}>$15</option>
            <option value={20}>$20</option>
          </select>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Delivery Details</h3>
          <p className="text-sm text-gray-600">
            Distance: {fakeDistance} miles
          </p>
          <p className="text-sm text-gray-600">
            Estimated delivery: {estimatedTime}
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Place Order
        </button>
      </form>
    </div>
  );
}
