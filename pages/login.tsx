import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/get-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch role');
      }

      const data = await res.json();
      const role = data.role;

      switch (role) {
        case 'buyer':
          router.push('/buyer/marketplace');
          break;
        case 'seller':
          router.push('/seller/dashboard');
          break;
        case 'stylist':
          router.push('/stylist/dashboard');
          break;
        case 'driver':
          router.push('/driver/dashboard');
          break;
        default:
          router.push('/onboarding');
          break;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('There was an issue logging in. Please try again.');
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
