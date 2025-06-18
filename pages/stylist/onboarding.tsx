import { useState } from 'react';
import supabase from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase'

export default function StylistApplicationPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    instagram: '',
    city: '',
    phone: '',
    specialty: '',
    portfolioUrl: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      setError('You must be logged in to apply.');
      return;
    }

    // Check if application already exists
    const { data: existing, error: fetchError } = await supabase
      .from('stylist_applications')
      .select('id')
      .eq('email', formData.email)
      .single();

    if (existing) {
      setError('You already submitted an application.');
      return;
    }

    const { error: insertError } = await supabase
      .from('stylist_applications')
      .insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          instagram: formData.instagram,
          city: formData.city,
          phone: formData.phone,
          specialty: formData.specialty,
          portfolio_url: formData.portfolioUrl,
          bio: '',
          booking_link: '',
          created_at: new Date().toISOString(),
        } satisfies Database['public']['Tables']['stylist_applications']['Insert'],
      ]);

    if (insertError) {
      setError('Submission failed. Please try again.');
      return;
    }

    // Update the user's role in Supabase metadata
    await supabase.auth.updateUser({
      data: {
        role: 'stylist',
      },
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Application Submitted</h1>
          <p className="text-gray-700">We'll review your info and reach out soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6">Stylist Application</h1>

        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
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
          type="text"
          name="specialty"
          placeholder="What’s your style specialty?"
          value={formData.specialty}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <input
          type="url"
          name="portfolioUrl"
          placeholder="Link to portfolio (optional)"
          value={formData.portfolioUrl}
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