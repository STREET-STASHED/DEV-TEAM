import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign-up logic here
    console.log('Sign up with email:', email);
    router.push('/onboarding');
  };

  return (
    <>
      <Head>
        <title>StreetStashed | Sign Up</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-yellow-800 text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/graffiti-wall.jpg')] bg-cover bg-center opacity-10 z-0"></div>
        
        <div className="relative z-10 w-full max-w-md px-6 py-10 bg-black/80 rounded-lg shadow-xl">
          <div className="mb-6 flex justify-center">
            <Image src="/logo.png" alt="StreetStashed Logo" width={180} height={50} />
          </div>
          <h1 className="text-3xl font-bold text-center text-gold-500 mb-4">Sign up to access the closet and get styled by the best</h1>
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-zinc-800 text-white rounded-md border border-zinc-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-gold-500 hover:bg-yellow-600 text-black font-semibold rounded-md transition duration-300"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
