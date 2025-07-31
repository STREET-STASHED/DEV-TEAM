import React, { useState } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

interface CheckoutFormProps {
  items: CartItem[];
  totalAmount: number;
}

export default function CheckoutForm({ items, totalAmount }: CheckoutFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation handled by HTML attributes
    const orderPayload = {
      name,
      address,
      email,
      items,
      totalAmount,
    };
    console.log("Submitting order:", orderPayload);
    alert("Order submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Delivery Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded hover:bg-primary transition"
      >
        Submit Order
      </button>
    </form>
  );
}
