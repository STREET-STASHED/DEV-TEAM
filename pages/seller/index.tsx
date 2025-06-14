import { useState } from 'react';

export default function SellerOnboarding() {
  const [form, setForm] = useState({ name: '', storeName: '', email: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Seller submitted:', form);
    alert('Seller submitted: ' + JSON.stringify(form));
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h2 className="text-2xl font-bold">StreetStashed Seller Onboarding</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded"
        />
        <input
          name="storeName"
          placeholder="Store Name"
          value={form.storeName}
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
        <button type="submit" className="bg-black text-white px-6 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
