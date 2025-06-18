import { useState } from 'react';
import supabase from '@/lib/supabaseClient';

export default function SellerApplicationPage() {
  const [formData, setFormData] = useState({
    brandName: '',
    contactName: '',
    email: '',
    instagram: '',
    city: '',
    phone: '',
    website: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      setError('User authentication failed.');
      return;
    }

    const user = session.user;

    // Check if seller already exists
    const { data: existingSellers, error: fetchError } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id);

    if (fetchError) {
      setError('Unable to check existing records. Try again later.');
      return;
    }

    if (existingSellers && existingSellers.length > 0) {
      setError('You have already submitted an application.');
      return;
    }

    // Insert seller row
    const { error: insertError } = await supabase.from('sellers').insert([
      {
        user_id: user.id,
        store_name: formData.brandName,
        full_name: formData.contactName,
        email: formData.email,
        instagram: formData.instagram,
        city: formData.city,
        phone: formData.phone,
        website: formData.website,
        status: 'approved',
      },
    ]);

    if (insertError) {
      setError('Submission failed. Please try again.');
      return;
    }

    // Update user role only if not already seller
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'seller', full_name: formData.contactName })
      .eq('id', user.id);

    if (updateError) {
      setError('Failed to update user role.');
      return;
    }

    setSubmitted(true);
    window.location.href = '/seller/dashboard';
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Application Submitted</h1>
          <p className="text-gray-700">We'll review your info and reach out soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-black text-yellow-400 p-8 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6">Seller Application</h1>

        <input
          type="text"
          name="brandName"
          placeholder="Brand / Store Name"
          value={formData.brandName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <input
          type="text"
          name="contactName"
          placeholder="Contact Name"
          value={formData.contactName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <input
          type="text"
          name="instagram"
          placeholder="Instagram Handle"
          value={formData.instagram}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <input
          type="url"
          name="website"
          placeholder="Store Website (optional)"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Submit Application
        </button>

        {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
}
