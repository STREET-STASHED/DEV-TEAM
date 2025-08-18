// pages/api/driver/assignments.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { z } from "zod";

const UpdateAssignmentSchema = z.object({
  status: z.enum(["picked_up", "en_route", "delivered", "cancelled"]),
  notes: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
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

  // Verify user is a driver
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "driver") {
    return res.status(403).json({ error: "Driver access required" });
  }

  switch (req.method) {
    case "GET":
      return handleGetAssignments(req, res, supabase as unknown as SupabaseClient<Database>, user);
    case "PATCH":
      return handleUpdateAssignment(req, res, supabase as unknown as SupabaseClient<Database>, user);
    default:
      res.setHeader("Allow", ["GET", "PATCH"]);
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

async function handleGetAssignments(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
  user: { id: string },
) {
  try {
    const { status } = req.query;

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*),
        profiles!orders_buyer_id_fkey (full_name, email)
      `,
      )
      .eq("driver_id", user.id);

    if (typeof status === "string") {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ assignments: data || [] });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}

async function handleUpdateAssignment(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
  user: { id: string },
) {
  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Assignment ID is required" });
    }

    // Validate input
    const parsed = UpdateAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return res.status(400).json({ error: `Invalid payload: ${msg}` });
    }

    const input = parsed.data;

    // Verify this is the driver's assignment
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, driver_id")
      .eq("id", id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (order.driver_id !== user.id) {
      return res.status(403).json({ error: "Not your assignment" });
    }

    // Update order status
    const { data: updatedOrder, error: updateErr } = await supabase
      .from("orders")
      .update({
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return res.status(400).json({ error: updateErr.message });
    }

    // If location provided, update tracking
    if (input.lat && input.lng) {
      await supabase.from("order_tracking").insert({
        order_id: id,
        driver_id: user.id,
        lat: input.lat,
        lng: input.lng,
        status: input.status,
      });
    }

    return res.status(200).json({ assignment: updatedOrder });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}
