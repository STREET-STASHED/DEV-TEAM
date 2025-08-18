// pages/api/tracking.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

const TrackingSchema = z.object({
  order_id: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  status: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

    // Auth
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate input
    const parsed = TrackingSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return res.status(400).json({ error: `Invalid payload: ${msg}` });
    }
    const input = parsed.data;

    // Verify user is the driver for this order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, driver_id")
      .eq("id", input.order_id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.driver_id !== user.id) {
      return res
        .status(403)
        .json({ error: "Only the assigned driver can update tracking" });
    }

    // Insert tracking update
    const { data: tracking, error: trackingErr } = await supabase
      .from("order_tracking")
      .insert({
        order_id: input.order_id,
        driver_id: user.id,
        lat: input.lat,
        lng: input.lng,
        status: input.status || "enroute",
      })
      .select()
      .single();

    if (trackingErr || !tracking) {
      return res.status(400).json({
        error: trackingErr?.message ?? "Tracking update failed",
      });
    }

    return res.status(201).json({
      id: tracking.id,
      order_id: tracking.order_id,
      status: tracking.status,
      lat: tracking.lat,
      lng: tracking.lng,
      updated_at: tracking.updated_at,
    });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}
