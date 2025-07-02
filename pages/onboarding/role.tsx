"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { createBrowserClient } from "@supabase/ssr";

export default function RolePage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Session expired—please log in again");
      setLoading(false);
      return;
    }

    const cleanRole = role.trim().toLowerCase();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: cleanRole,
        details_complete: false,
        has_completed_onboarding: false,
        onboarded: false
      })
      .eq("id", user.id);

    console.log("✅ Role update submitted:", cleanRole);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.updateUser({
      data: { role: cleanRole }
    });

    // go to next step; hook will pick up details_complete=false
    router.push("/onboarding/details");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-md bg-black text-white p-8 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Choose Your Role</h1>

        <div className="grid gap-4">
          {["buyer", "seller", "driver", "stylist"].map((r) => (
            <label key={r} className={`py-3 px-4 rounded-lg font-semibold border cursor-pointer transition-colors ${
              role === r
                ? "bg-yellow-500 text-black border-yellow-600"
                : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            }`}>
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="hidden"
              />
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </label>
          ))}
        </div>

        {error && (
          <p className="text-red-400 animate-pulse text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {loading ? "Saving…" : "Continue"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full py-2 mt-2 text-sm text-gray-400 hover:text-white underline"
        >
          ← Back
        </button>
      </form>
    </div>
  );
}
