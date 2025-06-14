import { useState } from 'react';

export default function StylistOnboarding() {
  const [form, setForm] = useState({ name: '', email: '', expertise: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Stylist submitted: ' + JSON.stringify(form));
  };

  return (
    <form className="p-6 space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">Stylist Onboarding</h2>
      <input name="name" placeholder="Your Name" onChange={handleChange} className="border p-2 w-full" />
      <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full" />
      <input name="expertise" placeholder="Style Expertise" onChange={handleChange} className="border p-2 w-full" />
      <button type="submit" className="bg-black text-white px-4 py-2">Submit</button>
    </form>
  );
}
