import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function StylistOnboarding() {
  const [form, setForm] = useState({ name: '', email: '', expertise: '' });
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('public.stylists').insert([{
      name: form.name,
      email: form.email,
      expertise: form.expertise,
      bio: '',
      booking_link: '',
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      setStatus('Failed to submit stylist: ' + error.message);
    } else {
      setStatus('Stylist submitted successfully!');
      setForm({ name: '', email: '', expertise: '' });
    }
  };

  return (
    <form className="p-6 space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">Stylist Onboarding</h2>
      <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} className="border p-2 w-full" />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 w-full" />
      <input name="expertise" placeholder="Style Expertise" value={form.expertise} onChange={handleChange} className="border p-2 w-full" />
      <button type="submit" className="bg-black text-white px-4 py-2">Submit</button>
      {status && <p className="text-sm text-red-600">{status}</p>}
    </form>
  );
}
