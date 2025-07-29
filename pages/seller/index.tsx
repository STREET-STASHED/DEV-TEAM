import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SellerDashboard() {
  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    phone: "",
    storeName: "",
    storeAddress: "",
    category: "",
    logoUrl: "", // placeholder for future logo uploads
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile && !error) {
        setForm((prev) => ({
          ...prev,
          ownerName: profile.full_name || "",
          email: profile.email || "",
          category: profile.role || "",
        }));
      }
    };

    loadProfileData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    const { error } = await supabase.from("storefronts").insert([
      {
        name: form.storeName,
        location: form.storeAddress,
        description: `Owner: ${form.ownerName}, Email: ${form.email}, Phone: ${form.phone}`,
        category: form.category,
        logo_url: form.logoUrl,
      },
    ]);

    if (error) {
      console.error(error);
      setStatus("Error submitting. Please try again.");
    } else {
      setStatus("Store setup complete!");
      setForm({
        ownerName: "",
        email: "",
        phone: "",
        storeName: "",
        storeAddress: "",
        category: "",
        logoUrl: "",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h2 className="text-2xl font-bold">StreetStashed Seller Dashboard</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="ownerName"
            placeholder="Your Name"
            value={form.ownerName}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded"
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded"
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded"
          />
          <input
            name="logoUrl"
            placeholder="Logo URL (optional)"
            value={form.logoUrl}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded"
          />
        </div>

        <hr className="my-4" />

        <input
          name="storeName"
          placeholder="Store Name"
          value={form.storeName}
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded"
        />
        <input
          name="storeAddress"
          placeholder="Store Address"
          value={form.storeAddress}
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded"
        />
        <input
          name="category"
          placeholder="Category (e.g., streetwear, accessories)"
          value={form.category}
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded"
        />

        <button type="submit" className="bg-black text-white px-6 py-2 rounded">
          Submit
        </button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
    </div>
  );
}
