import { useState } from "react";
import { useRouter } from "next/router";
import { createBrowserClient } from "@supabase/ssr";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<
    "buyer" | "seller" | "stylist" | "driver" | ""
  >("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password || !name || !role || !username) {
      setError("Please fill in all fields before signing up.");
      setLoading(false);
      return;
    }

    const payload = {
      email,
      password,
      userData: {
        full_name: name,
        role,
        username, // added username field,
      },
    };

    console.log("[SIGNUP SUBMIT]", payload);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON:", jsonErr);
        setError("Unexpected server response. Please try again.");
        setLoading(false);
        return;
      }

      if (![200, 201].includes(response.status)) {
        console.error("[SIGNUP ERROR]", result);
        setError(result?.error || "Signup failed.");
        setLoading(false);
        return;
      }

      console.log("[SIGNUP SUCCESS]", result);

      // Auto-login after successful signup using Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AUTO-LOGIN ERROR]", error);
        setError(error.message || "Login failed. Redirecting to onboarding...");
        await router.push("/onboarding");
        return;
      }

      // login successful, fetch session once and redirect based on role
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session || !session.access_token || !session.user?.id) {
        console.warn("[SESSION INVALID] Redirecting to onboarding.");
        await router.replace("/onboarding");
        return;
      }

      const access_token = session.access_token;
      const user_id = session.user.id;

      try {
        const redirectResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/handle-redirect`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({ user_id }),
          },
        );

        const redirectData = await redirectResponse.json();

        const path = redirectData?.redirectTo || "/onboarding";
        await router.replace(path);
        if (path === "/onboarding") router.reload();
      } catch (err) {
        console.error("[REDIRECT ERROR]", err);
        await router.replace("/onboarding");
      }
    } catch (err) {
      console.error("[SIGNUP EXCEPTION]", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <input
        id="username"
        name="username"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      <input
        id="full_name"
        name="full_name"
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        required
        autoComplete="email"
      />
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        required
        autoComplete="new-password"
      />
      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-labelledby="role-label"
      >
        {["buyer", "seller", "stylist", "driver"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r as typeof role)}
            className={`p-2 border rounded text-center capitalize ${
              role === r
                ? "bg-black text-white border-black"
                : "border-gray-300"
            }`}
            aria-pressed={role === r}
          >
            {r}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        disabled={!role || loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm mt-4 p-2 rounded text-center">
          {error}
        </div>
      )}
    </form>
  );
}
