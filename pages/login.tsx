import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import { supabase } from '../supabase/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Authenticating with email:', email);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` }
        });

        if (signUpError) {
          console.error('Sign-up error:', signUpError.message);
          return;
        }

        console.log('Signed up. Check email for confirmation.');
        return;
      } else {
        console.error('Sign-in error:', signInError.message);
        return;
      }
    }

    router.push('/onboarding');
  };

  return (
    <>
      <Head>
        <title>StreetStashed | Sign Up</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-yellow-800 text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center bg-fixed opacity-20 z-0"></div>

        <div className="relative z-10 w-full max-w-md px-6 py-10 bg-black/80 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center text-yellow-400 mb-4 font-graffiti">
            Access the closet – Log in or Sign up to get styled by the best
          </h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-zinc-800 text-white rounded-md border border-zinc-600 placeholder-gray-400 font-graffiti focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-zinc-800 text-white rounded-md border border-zinc-600 placeholder-gray-400 font-graffiti focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-graffiti rounded-md transition duration-300"
            >
              Log In / Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
