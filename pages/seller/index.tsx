import { useState } from 'react';
import supabase from '../../lib/supabaseClient';

export default function SellerOnboarding() {
  const [form, setForm] = useState({ name: '', storeName: '', email: '', phone: '', storeAddress: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');

    const { error } = await supabase.from('storefronts').insert([
      {
        name: form.storeName,
        location: form.storeAddress,
        description: `Owner: ${form.name}, Email: ${form.email}, Phone: ${form.phone}`
      }
    ]);

    if (error) {
      console.error(error);
      setStatus('Error submitting. Please try again.');
    } else {
      setStatus('Seller info submitted successfully!');
      setForm({ name: '', storeName: '', email: '', phone: '', storeAddress: '' });
    }
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
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
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
        <button type="submit" className="bg-black text-white px-6 py-2 rounded">
          Submit
        </button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
    </div>
  );
}
