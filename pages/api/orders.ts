// pages/api/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

const OrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(), // product id
        name: z.string(),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive(),
        image_url: z.string().nullable().optional(),
      }),
    )
    .min(1, "At least one item required"),
  city: z.string().optional(),
  seller_id: z.string().uuid().optional(),
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
    if (userErr || !user)
      return res.status(401).json({ error: "Unauthorized" });

    // Validate input
    const parsed = OrderSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return res.status(400).json({ error: `Invalid payload: ${msg}` });
    }
    const input = parsed.data;

    // Calculate total server-side from items
    const calculatedTotal = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        seller_id: input.seller_id ?? null,
        status: "pending",
        total: calculatedTotal,
        city: input.city ?? null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      return res
        .status(400)
        .json({ error: orderErr?.message ?? "Order create failed" });
    }

    // Insert order_items (map image_url -> image)
    const itemsPayload = input.items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image_url ?? null,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemsPayload);
    if (itemsErr) return res.status(400).json({ error: itemsErr.message });

    // TODO: Stripe PaymentIntent creation & webhook to set status='paid'
    return res.status(201).json({ id: order.id, status: order.status });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}
