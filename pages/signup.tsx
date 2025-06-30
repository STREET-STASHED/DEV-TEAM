"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { getDashboardRedirect } from "@/lib/getDashboardRedirect";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createPagesBrowserClient();

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;

        const { data: userProfile } = await supabase
          .from("users")
          .select("role, details_complete, verified")
          .eq("id", data.user.id)
          .single();

        if (!userProfile) {
          setError("Something went wrong loading your profile.");
          setLoading(false);
          return;
        }

        if (!userProfile?.role || !userProfile?.details_complete || !userProfile?.verified) {
          router.push("/onboarding/role");
        } else {
          const dashboardPath = getDashboardRedirect(userProfile.role?.toLowerCase() || "");
          router.push(dashboardPath);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/onboarding/role`,
          },
        });

        console.log("✅ Signup result:", data);
        console.log("❌ Signup error:", error);

        if (error) throw error;

        if (!data?.user) {
          setError("Signup failed to create user.");
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Initialize profile row for the new user
          const { error: insertError } = await supabase
            .from("users")
            .insert([{
              id: data.user.id,
              email: data.user.email,
              role: null,
              details_complete: false,
              verified: false,
              has_completed_onboarding: false,
              verification_complete: false,
              onboarded: false
            }]);
          if (insertError) {
            console.error("Failed to create user profile:", insertError.message);
            setError("Signup succeeded but failed to initialize your profile. Please contact support.");
            setLoading(false);
            return;
          }

          // Immediately check the session after signup
          const {
            data: { session: newSession },
            error: sessionError
          } = await supabase.auth.getSession();

          if (sessionError || !newSession) {
            console.error("⚠️ Session not available after signup:", sessionError);
          } else {
            console.log("✅ Session after signup:", newSession);
          }

          router.push("/onboarding/role");
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpg')" }}>
      <div className="w-full max-w-md p-8 bg-black bg-opacity-90 text-white shadow-lg rounded-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-600">StreetStashed</h1>
        <form onSubmit={handleAuth}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-800">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
          >
            {loading ? (isLogin ? "Logging in..." : "Signing up...") : (isLogin ? "Log In" : "Sign Up")}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-700">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-yellow-600 font-semibold hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}