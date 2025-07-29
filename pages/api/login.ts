import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (key) => req.cookies[key] ?? "",
          set: (key, value) => {
            res.setHeader(
              "Set-Cookie",
              `${key}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax`,
            );
          },
          remove: (key) => {
            res.setHeader("Set-Cookie", `${key}=; Max-Age=0; Path=/`);
          },
        },
      },
    );

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData?.user) {
      return res
        .status(400)
        .json({ error: authError?.message || "Invalid login" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, has_completed_onboarding")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError || !profile) {
      return res
        .status(500)
        .json({ error: profileError?.message || "Profile not found" });
    }

    const redirectTo = profile.has_completed_onboarding
      ? "/dashboard"
      : "/onboarding";

    res.setHeader(
      "Set-Cookie",
      `sb-access-token=${authData.session?.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    );
    res.setHeader(
      "Set-Cookie",
      `sb-refresh-token=${authData.session?.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    );
    console.log("[LOGIN SUCCESS]", {
      user_id: authData.user.id,
      redirectTo,
      onboarding_complete: profile.has_completed_onboarding,
      role: profile.role,
    });

    return res.status(200).json({
      message: "Login successful",
      redirectTo,
      role: profile.role,
      onboarding_complete: profile.has_completed_onboarding,
      user_id: authData.user.id,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
}
