import haversine from "haversine-distance";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { calculateStashedSupportFee } from "@/lib/fees";

export default function CheckoutForm() {
  const { items, totalAmount } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const [estimatedTime, setEstimatedTime] = useState("");
  const [fakeDistance, setFakeDistance] = useState(0);
  const [tip, setTip] = useState(0);

  React.useEffect(() => {
    const buyerCoords = { lat: 40.4406, lng: -79.9959 }; // Replace with dynamic geolocation later
    const storeCoords = { lat: 40.456, lng: -79.9801 }; // Example coordinates; replace with actual seller/store coords

    const distance = haversine(buyerCoords, storeCoords) / 1609; // convert meters to miles
    const rounded = Math.round(distance * 10) / 10;
    setFakeDistance(rounded);

    if (distance <= 2) setEstimatedTime("25–35 min");
    else if (distance <= 5) setEstimatedTime("35–55 min");
    else if (distance <= 8) setEstimatedTime("55–70 min");
    else setEstimatedTime("70–90 min");
  }, []);

  // Updated supportFee model
  const { buyerFee } = calculateStashedSupportFee({
    distance: fakeDistance,
    orderTotal: totalAmount ?? 0,
  });
  const supportFee = buyerFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation handled by HTML attributes

    const orderPayload = {
      name,
      address,
      email,
      items,
      totalAmount,
      tip,
    };
    console.log("Submitting order:", orderPayload);
    alert("Order submitted successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white text-black dark:bg-black dark:text-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Review and Checkout</h2>

      <div className="space-y-4 border-b pb-4">
        {items?.map((item: any) => (
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
          <span>Subtotal</span>
          <span>${(totalAmount ?? 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-start relative group">
          <div>
            <div className="flex items-center space-x-1">
              <span className="block font-medium">Stashed Support Fee</span>
              <div className="relative">
                <span className="text-xs cursor-pointer">ℹ️</span>
                <div className="absolute left-0 mt-1 w-56 bg-black text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  Bundled fee covers driver delivery, order support, and
                  platform operations.
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              Estimated delivery: {estimatedTime}
            </span>
          </div>
          <span className="text-right">${supportFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-sm">Tip (optional)</label>
          <input
            type="number"
            value={tip}
            onChange={(e) => setTip(Number(e.target.value))}
            min={0}
            step={0.5}
            className="w-24 border border-gray-300 dark:border-white bg-white dark:bg-black text-black dark:text-white px-2 py-1 rounded text-sm"
          />
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Total</span>
          <span>${((totalAmount ?? 0) + supportFee + tip).toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold">Shipping Info</h3>
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-white bg-white dark:bg-black text-black dark:text-white px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-white bg-white dark:bg-black text-black dark:text-white px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Delivery Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-white bg-white dark:bg-black text-black dark:text-white px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded text-lg hover:bg-yellow-500 transition"
        >
          Place Order
        </button>
      </form>
    </div>
  );
}
