"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import useOnboardingRedirect from "@/hooks/useOnboardingRedirect";

export default function RolePage() {
  const router = useRouter();
  useOnboardingRedirect();   // 🔥 just call the hook—no destructure

  const supabase = createClientComponentClient();
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
      .from("users")
      .update({ role: cleanRole, details_complete: false, verified: false })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // go to next step; hook will pick up details_complete=false
    router.push("/onboarding/details");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-center">Choose Your Role</h1>
        {["buyer", "seller", "driver", "stylist"].map((r) => (
          <label key={r} className="flex items-center space-x-2">
            <input
              type="radio"
              name="role"
              value={r}
              checked={role === r}
              onChange={() => setRole(r)}
              className="h-5 w-5 text-blue-600 bg-white border-gray-300 focus:ring-blue-500"
            />
            <span className="capitalize">{r}</span>
          </label>
        ))}
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600"}`}
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
