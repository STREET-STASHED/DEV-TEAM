/// <reference lib="dom" />
/* eslint-env browser */
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router"; // Pages Router
import { useCart } from "../context/CartContext";
import type { CartItem } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";

interface CheckoutFormProps {
  items: CartItem[];
  totalAmount: number;
  mode?: "buyNow" | "cart" | "buyer";
}

export default function CheckoutForm({
  items,
  totalAmount,
  mode = "buyNow",
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { clearCart } = useCart();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, address, city, state, zip")
        .eq("id", user.id)
        .single();

      if (profile && !profileError) {
        const [firstName, ...rest] = profile.full_name?.split(" ") || [""];
        const lastName = rest.join(" ");
        setForm((prev) => ({
          ...prev,
          firstName,
          lastName,
          email: profile.email || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          zip: profile.zip || "",
        }));
      }
    };

    void fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Build payload for /api/orders
      const payload = {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: (item as { image_url?: string; image?: string }).image_url ?? (item as { image?: string }).image ?? null,
        })),
        total: totalAmount,
        city: form.city || undefined,
        seller_id: (form as { seller_id?: string }).seller_id || undefined,
      };

      const response = await axios.post("/api/orders", payload);
      const data = response.data;

      if (response.status === 201 && data?.id) {
        setSuccess(true);
        if (mode === "cart" || mode === "buyer") clearCart?.();
        await router.push(`/buyer/order-tracking/${data.id}`);
        return;
      }

      throw new Error(data?.error || "Order creation failed");
    } catch (err: unknown) {
      const errorResponse = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      const message =
        errorResponse?.error ||
        errorResponse?.message ||
        (err instanceof Error ? err.message : "An unexpected error occurred");
      setError(`Order failed: ${message}`);
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="max-w-md mx-auto p-8 border-2 border-black rounded-lg bg-black text-white"
    >
      <h2 className="text-yellow-400 text-2xl font-bold mb-4">
        Secure Checkout
      </h2>

      <label htmlFor="firstName" className="block text-sm font-medium mb-1">
        First Name
      </label>
      <input
        id="firstName"
        name="firstName"
        placeholder="First Name"
        onChange={handleChange}
        value={form.firstName}
        required
        aria-required="true"
        className="block w-full p-2 mb-3 rounded border border-gray-300"
      />
      <label htmlFor="lastName" className="block text-sm font-medium mb-1">
        Last Name
      </label>
      <input
        id="lastName"
        name="lastName"
        placeholder="Last Name"
        onChange={handleChange}
        value={form.lastName}
        required
        aria-required="true"
        className="block w-full p-2 mb-3 rounded border border-gray-300"
      />
      <label htmlFor="email" className="block text-sm font-medium mb-1">
        Email Address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email Address"
        onChange={handleChange}
        value={form.email}
        required
        aria-required="true"
        className="block w-full p-2 mb-3 rounded border border-gray-300"
      />
      <label htmlFor="address" className="block text-sm font-medium mb-1">
        Shipping Address
      </label>
      <input
        id="address"
        name="address"
        placeholder="Shipping Address"
        onChange={handleChange}
        value={form.address}
        required
        aria-required="true"
        className="block w-full p-2 mb-3 rounded border border-gray-300"
      />
      <label htmlFor="city" className="block text-sm font-medium mb-1">
        City
      </label>
      <input
        id="city"
        name="city"
        placeholder="City"
        onChange={handleChange}
        value={form.city}
        required
        aria-required="true"
        className="block w-full p-2 mb-3 rounded border border-gray-300"
      />
      <label htmlFor="state" className="block text-sm font-medium mb-1">
        State
      </label>
      <input
        id="state"
        name="state"
        placeholder="State"
        onChange={handleChange}
        value={form.state}
        required
        aria-required="true"
        className="block w-full p-2 mb-3 rounded border border-gray-300"
      />
      <label htmlFor="zip" className="block text-sm font-medium mb-1">
        Zip Code
      </label>
      <input
        id="zip"
        name="zip"
        placeholder="Zip Code"
        onChange={handleChange}
        value={form.zip}
        required
        aria-required="true"
        className="block w-full p-2 mb-3 rounded border border-gray-300"
      />

      <div className="my-4">
        <strong>Order Total:</strong> ${totalAmount.toFixed(2)}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-yellow-400 text-black font-bold rounded disabled:opacity-60"
      >
        {loading
          ? "Processing..."
          : mode === "buyNow"
            ? "Buy Now"
            : mode === "buyer"
              ? "Checkout as Buyer"
              : "Place Order"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">Payment successful!</p>}
    </form>
  );
}
