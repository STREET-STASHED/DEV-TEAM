// pages/api/admin/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const UpdateOrderSchema = z.object({
  status: z.enum(["pending", "processing", "delivered", "cancelled"]),
  driver_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const supabase = createSupabaseServerClient(req, res);

  // Auth check
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Verify user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  switch (req.method) {
    case "GET":
      return handleGetOrders(req, res, supabase as unknown as SupabaseClient<Database>);
    case "PATCH":
      return handleUpdateOrder(req, res, supabase as unknown as SupabaseClient<Database>);
    default:
      res.setHeader("Allow", ["GET", "PATCH"]);
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

async function handleGetOrders(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
) {
  try {
    const { status, seller_id, buyer_id, driver_id } = req.query;

    let query = supabase.from("orders").select(`
        *,
        order_items (*),
        profiles!orders_buyer_id_fkey (full_name, email),
        profiles!orders_seller_id_fkey (full_name, email),
        profiles!orders_driver_id_fkey (full_name, email)
      `);

    if (typeof status === "string") {
      query = query.eq("status", status);
    }
    if (typeof seller_id === "string") {
      query = query.eq("seller_id", seller_id);
    }
    if (typeof buyer_id === "string") {
      query = query.eq("buyer_id", buyer_id);
    }
    if (typeof driver_id === "string") {
      query = query.eq("driver_id", driver_id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ orders: data || [] });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}

async function handleUpdateOrder(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
) {
  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Validate input
    const parsed = UpdateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return res.status(400).json({ error: `Invalid payload: ${msg}` });
    }

    const input = parsed.data;

    // Update order
    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update({
        status: input.status,
        driver_id: input.driver_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ order: updatedOrder });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}
