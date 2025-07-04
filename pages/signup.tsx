import { useState } from "react";
import Image from 'next/image';
import logo from '../public/logo.png';
import { useRouter } from "next/router";
import Head from "next/head";
import { createBrowserClient } from '@supabase/ssr';
import { getDashboardRedirect } from "@/lib/getDashboardRedirect";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const updateProfile = async (updates: Record<string, any>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates });
    if (error) {
      console.error('Error updating profile during sign-up:', error.message);
    }
  }
};

export default function Signup() {
  const [isLogin, setIsLogin] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!email || !password || (!isLogin && !fullName)) {
        setError("Please fill out all required fields.");
        setLoading(false);
        return;
      }

      if (!isLogin) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding/role`,
            data: { full_name: fullName },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        await updateProfile({
          full_name: fullName,
          has_completed_onboarding: false,
          details_complete: false,
        });

        router.push("/onboarding/role");
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message);
          setLoading(false);
          return;
        }

        // After successful login, route to onboarding/role to continue onboarding flow
        router.push('/onboarding/role');
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>StreetStashed — Sign Up / Log In</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl px-8 py-10 flex flex-col items-center">
          <div className="w-full flex justify-center">
            <div className="h-20 w-20 flex items-center justify-center border border-gray-700 rounded mb-4">
              <Image
                src={logo}
                alt="StreetStashed Logo"
                height={64}
                width={64}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-yellow-400 mb-2">
            StreetStashed
          </h1>
          <h2 className="text-xl font-semibold text-white mb-8">
            {isLogin ? "Log In to Your Account" : "Create Your Account"}
          </h2>
          <form className="w-full" onSubmit={handleAuth} autoComplete="off">
            {!isLogin && (
              <div className="mb-5">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-lg px-4 py-3 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg px-4 py-3 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full rounded-lg px-4 py-3 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {error && (
              <div className="mb-4 text-red-500 text-sm font-medium text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-lg transition-colors duration-150 ${
                loading
                  ? "bg-yellow-300 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
              } text-black shadow-md`}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Log In"
                : "Sign Up"}
            </button>
          </form>
          <div className="mt-6 text-gray-300 text-center">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  className="text-yellow-400 hover:text-yellow-300 font-semibold underline transition"
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-yellow-400 hover:text-yellow-300 font-semibold underline transition"
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}