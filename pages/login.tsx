import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    if (email.includes('buyer')) {
      router.push('/buyer');
    } else if (email.includes('seller')) {
      router.push('/seller');
    } else if (email.includes('stylist')) {
      router.push('/stylist');
    } else if (email.includes('driver')) {
      router.push('/driver');
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded shadow-md">
        <h1 className="text-2xl mb-4 font-bold text-center">Login to StreetStashed</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 text-black rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-bold py-2 px-4 rounded hover:bg-yellow-400"
        >
          Login
        </button>
      </form>
    </div>
  );
}
