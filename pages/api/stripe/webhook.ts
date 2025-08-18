import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return res
      .status(400)
      .json({ error: "Webhook signature verification failed" });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case "charge.succeeded":
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case "charge.failed":
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  console.log("Payment succeeded:", paymentIntent.id);

  try {
    // Update order status in database
    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_intent_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return;
    }

    // Send notification to seller
    await sendSellerNotification(order.seller_id, "payment_received", {
      order_id: order.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });

    // Send notification to buyer
    await sendBuyerNotification(order.buyer_id, "payment_confirmed", {
      order_id: order.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  try {
    // Update order status in database
    const { error } = await supabase
      .from("orders")
      .update({
        status: "payment_failed",
        payment_failed_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id);

    if (error) {
      console.error("Error updating order:", error);
      return;
    }

    // Send notification to buyer about payment failure
    const { data: order } = await supabase
      .from("orders")
      .select("id, buyer_id")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single();

    if (order) {
      await sendBuyerNotification(order.buyer_id, "payment_failed", {
        order_id: order.id,
        reason: paymentIntent.last_payment_error?.message || "Payment failed",
      });
    }
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
  console.log("Charge succeeded:", charge.id);

  try {
    // Update order with charge details
    const { error } = await supabase
      .from("orders")
      .update({
        charge_id: charge.id,
        charge_amount: charge.amount,
        charge_currency: charge.currency,
        charge_status: charge.status,
      })
      .eq("stripe_payment_intent_id", charge.payment_intent as string);

    if (error) {
      console.error("Error updating order with charge:", error);
    }
  } catch (error) {
    console.error("Error handling charge success:", error);
  }
}

async function handleChargeFailed(charge: Stripe.Charge) {
  console.log("Charge failed:", charge.id);

  try {
    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        status: "charge_failed",
        charge_failed_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", charge.payment_intent as string);

    if (error) {
      console.error("Error updating order with charge failure:", error);
    }
  } catch (error) {
    console.error("Error handling charge failure:", error);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  console.log("Account updated:", account.id);

  try {
    // Update seller verification status
    const { error } = await supabase
      .from("profiles")
      .update({
        stripe_account_id: account.id,
        stripe_account_status: account.charges_enabled ? "verified" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_account_id", account.id);

    if (error) {
      console.error("Error updating profile:", error);
    }
  } catch (error) {
    console.error("Error handling account update:", error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("Subscription created:", subscription.id);

  try {
    // Handle premium subscription creation
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: "premium",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", subscription.customer as string);

    if (error) {
      console.error("Error updating profile with subscription:", error);
    }
  } catch (error) {
    console.error("Error handling subscription creation:", error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("Subscription updated:", subscription.id);

  try {
    // Update subscription status
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscription.id);

    if (error) {
      console.error("Error updating subscription:", error);
    }
  } catch (error) {
    console.error("Error handling subscription update:", error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("Subscription deleted:", subscription.id);

  try {
    // Update subscription status
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        subscription_tier: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscription.id);

    if (error) {
      console.error("Error updating subscription:", error);
    }
  } catch (error) {
    console.error("Error handling subscription deletion:", error);
  }
}

async function sendSellerNotification(
  sellerId: string,
  type: string,
  data: Record<string, unknown>,
) {
  try {
    // Send notification to seller
    const { error } = await supabase.from("notifications").insert({
      user_id: sellerId,
      type,
      data,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error sending seller notification:", error);
    }
  } catch (error) {
    console.error("Error in sendSellerNotification:", error);
  }
}

async function sendBuyerNotification(buyerId: string, type: string, data: Record<string, unknown>) {
  try {
    // Send notification to buyer
    const { error } = await supabase.from("notifications").insert({
      user_id: buyerId,
      type,
      data,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error sending buyer notification:", error);
    }
  } catch (error) {
    console.error("Error in sendBuyerNotification:", error);
  }
}
