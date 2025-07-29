import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function StylistDashboard() {
  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    phone: "",
    stylistName: "",
    location: "",
    category: "",
    logoUrl: "", // placeholder for future logo uploads
    bundleOfferings: "",
    consultations: "",
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
          bundleOfferings: profile.bundle_offerings || "",
          consultations: profile.consultations || "",
        }));
      }
    };

    loadProfileData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    const { error } = await supabase.from("stylists").insert([
      {
        name: form.stylistName,
        location: form.location,
        description: `Owner: ${form.ownerName}, Email: ${form.email}, Phone: ${form.phone}`,
        category: form.category,
        logo_url: form.logoUrl,
        bundle_offerings: form.bundleOfferings,
        consultations: form.consultations,
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
        stylistName: "",
        location: "",
        category: "",
        logoUrl: "",
        bundleOfferings: "",
        consultations: "",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h2 className="text-2xl font-bold">StreetStashed Stylist Dashboard</h2>
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
          name="stylistName"
          placeholder="Stylist Name"
          value={form.stylistName}
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded"
        />
        <input
          name="location"
          placeholder="Studio or Location"
          value={form.location}
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
        <textarea
          name="bundleOfferings"
          placeholder="Describe your bundle offerings"
          value={form.bundleOfferings}
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded"
          rows={4}
        />
        <textarea
          name="consultations"
          placeholder="Describe your consultation options"
          value={form.consultations}
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded"
          rows={4}
        />

        <button type="submit" className="bg-black text-white px-6 py-2 rounded">
          Submit
        </button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
    </div>
  );
}
