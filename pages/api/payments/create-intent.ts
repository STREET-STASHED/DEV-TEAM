import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import { createPaymentIntent } from "../../../lib/stripe";
import { z } from "zod";

// Validation schema
const CreateIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default("usd"),
  orderId: z.string().uuid(),
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  paymentMethodId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request body
    const validation = CreateIntentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: validation.error.errors,
      });
    }

    const { amount, currency, orderId, buyerId, sellerId } =
      validation.data;

    // Initialize Supabase client
    const supabase = createSupabaseServerClient(req, res);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user is the buyer
    if (user.id !== buyerId) {
      return res.status(403).json({
        error: "Forbidden: Can only create payments for your own orders",
      });
    }

    // Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, buyer_id, seller_id, total, status")
      .eq("id", orderId)
      .eq("buyer_id", buyerId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify order status allows payment
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Order cannot be paid at this time" });
    }

    // Verify amount matches order total
    if (Math.abs(order.total - amount) > 0.01) {
      return res
        .status(400)
        .json({ error: "Payment amount does not match order total" });
    }

    // Verify seller exists and is verified
    const { data: sellerProfile, error: sellerError } = await supabase
      .from("profiles")
      .select("id, verification_status, stripe_account_id")
      .eq("id", sellerId)
      .eq("role", "seller")
      .single();

    if (sellerError || !sellerProfile) {
      return res.status(404).json({ error: "Seller not found" });
    }

    if (sellerProfile.verification_status !== "approved") {
      return res.status(400).json({ error: "Seller is not verified" });
    }

    if (!sellerProfile.stripe_account_id) {
      return res
        .status(400)
        .json({ error: "Seller payment account not set up" });
    }

    // Create payment intent with Stripe
    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      orderId,
      buyerId,
      sellerId: sellerProfile.stripe_account_id,
      metadata: {
        orderId,
        buyerId,
        sellerId,
        type: "delivery_order",
        platform: "streetstashed",
      },
    });

    // Update order with payment intent ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_intent: paymentIntent.paymentIntentId,
        status: "payment_processing",
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order with payment intent:", updateError);
      // Don't fail the request, but log the error
    }

    // Log payment intent creation
    console.log(
      `Payment intent created for order ${orderId}: ${paymentIntent.paymentIntentId}`,
    );

    return res.status(200).json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}
