// pages/api/seller/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createSupabaseServerClient(req, res);

  // Auth
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Query only this seller's orders
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ orders: data ?? [] });
}
