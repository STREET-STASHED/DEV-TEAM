import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentMethodId, items, name, email } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: "Missing payment method ID" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing cart items" });
    }

    if (
      !items.every(
        (item) =>
          typeof item.price === "number" && typeof item.quantity === "number",
      )
    ) {
      return res.status(400).json({ error: "Invalid item format" });
    }

    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      payment_method: paymentMethodId,
      confirmation_method: "automatic",
      confirm: true,
      metadata: {
        customer_name: name,
        customer_email: email,
        cart: JSON.stringify(items),
      },
      receipt_email: email,
      description: `In-app order by ${name}`,
    });

    if (
      paymentIntent.status === "requires_action" &&
      paymentIntent.next_action?.type === "use_stripe_sdk"
    ) {
      return res.status(200).json({
        requiresAction: true,
        paymentIntentClientSecret: paymentIntent.client_secret,
      });
    }

    if (paymentIntent.status !== "succeeded") {
      return res
        .status(500)
        .json({ error: "Payment failed", status: paymentIntent.status });
    }

    return res.status(200).json({
      success: true,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    });
  } catch (err: any) {
    console.error("Charge error:", err);
    return res.status(500).json({
      error: err?.message || "Internal server error",
    });
  }
}
