import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (key: string) => cookieStore.get(key)?.value ?? null,
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({ user });
}
