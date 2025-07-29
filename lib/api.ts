import { supabase } from "@/lib/supabaseClient";
export async function callEdge(
  path: string,
  payload: any = {},
  method = "POST",
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("No authenticated user found.");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("No active session found.");

  const access_token = session.access_token;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return res.json();
}
