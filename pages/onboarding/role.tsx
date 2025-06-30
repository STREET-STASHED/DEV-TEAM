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
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md bg-black text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Choose Your Role</h1>
        <label className="block">
          <span className="text-gray-700">Select Your Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="mt-2 block w-full p-3 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              -- Choose a role --
            </option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="driver">Driver</option>
            <option value="stylist">Stylist</option>
          </select>
        </label>
        {error && <p className="text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${loading ? "bg-gray-600" : "bg-yellow-500 hover:bg-yellow-600"}`}
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
