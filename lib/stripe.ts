import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_IS_TEST_MODE === 'true';

// Use test keys in development, live keys in production
const getStripeKeys = () => {
  if (isDevelopment) {
    return {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.replace('pk_live_', 'pk_test_') || 'pk_test_fallback',
      secretKey: process.env.STRIPE_SECRET_KEY?.replace('sk_live_', 'sk_test_') || 'sk_test_fallback'
    };
  }

  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!
  };
};

const { publishableKey, secretKey } = getStripeKeys();

const stripe = new Stripe(secretKey, {
  apiVersion: "2025-08-27.basil",
});

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(publishableKey);
};

// Export server-side stripe instance
export { stripe };

// Payment Intent creation with escrow
export const createPaymentIntent = async (params: {
  amount: number;
  currency: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  metadata?: Record<string, string>;
}) => {
  const { amount, currency, orderId, buyerId, sellerId, metadata } = params;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId,
        buyerId,
        sellerId,
        type: "delivery_order",
        ...metadata,
      },
      // Enable escrow by using capture_method: 'manual'
      capture_method: "manual",
      // Set up automatic capture after delivery confirmation
      automatic_payment_methods: {
        enabled: true,
      },
      // Add application fee for platform
      application_fee_amount: Math.round(amount * 0.05 * 100), // 5% platform fee
      transfer_data: {
        destination: sellerId, // Seller's connected account
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
};

// Capture payment after delivery confirmation
export const capturePayment = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    };
  } catch (error) {
    console.error("Error capturing payment:", error);
    throw new Error("Failed to capture payment");
  }
};

// Refund payment (for disputes or cancellations)
export const refundPayment = async (
  paymentIntentId: string,
  reason?: string,
) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: (reason as "duplicate" | "fraudulent" | "requested_by_customer") || "requested_by_customer",
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    };
  } catch (error) {
    console.error("Error processing refund:", error);
    throw new Error("Failed to process refund");
  }
};

// Create connected account for sellers
export const createSellerAccount = async (params: {
  email: string;
  businessName: string;
  country: string;
  currency: string;
}) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: params.country,
      email: params.email,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: params.businessName,
        url: process.env.NEXT_PUBLIC_FRONTEND_URL,
        mcc: "5999", // Miscellaneous and specialty retail stores
      },
      default_currency: params.currency,
    });

    return {
      accountId: account.id,
      accountLink: await createAccountLink(account.id),
    };
  } catch (error) {
    console.error("Error creating seller account:", error);
    throw new Error("Failed to create seller account");
  }
};

// Create account link for onboarding
const createAccountLink = async (accountId: string) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/seller/onboarding`,
      return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/seller/dashboard`,
      type: "account_onboarding",
    });

    return accountLink.url;
  } catch (error) {
    console.error("Error creating account link:", error);
    throw new Error("Failed to create account link");
  }
};

// Get account status
export const getAccountStatus = async (accountId: string) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      id: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      detailsSubmitted: account.details_submitted,
    };
  } catch (error) {
    console.error("Error retrieving account status:", error);
    throw new Error("Failed to retrieve account status");
  }
};

// Create subscription for premium features
export const createSubscription = async (params: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: (subscription.latest_invoice as { payment_intent?: { client_secret?: string } })?.payment_intent
        ?.client_secret,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }
};

// Webhook event handling
export const handleWebhookEvent = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case "account.updated":
        await handleAccountUpdate(event.data.object as Stripe.Account);
        break;

      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    throw error;
  }
};

// Payment success handler
const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent) => {
  const { orderId } = paymentIntent.metadata;

  // Update order status in database
  // Send notifications to buyer and seller
  // Update inventory
  console.log(`Payment succeeded for order ${orderId}`);
};

// Payment failure handler
const handlePaymentFailure = async (paymentIntent: Stripe.PaymentIntent) => {
  const { orderId } = paymentIntent.metadata;

  // Update order status
  // Send failure notification to buyer
  // Attempt retry logic
  console.log(`Payment failed for order ${orderId}`);
};

// Account update handler
const handleAccountUpdate = async (account: Stripe.Account) => {
  // Update seller verification status
  // Send notification about account changes
  console.log(`Account ${account.id} updated`);
};

// Dispute handler
const handleDisputeCreated = async (dispute: Stripe.Dispute) => {
  // Handle customer disputes
  // Update order status
  // Notify relevant parties
  console.log(`Dispute created for charge ${dispute.charge}`);
};

// Utility functions
export const formatStripeAmount = (
  amount: number,
  currency: string = "usd",
): number => {
  const currencies = [
    "jpy",
    "bif",
    "clp",
    "djf",
    "gnf",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "ugx",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
  ];
  const multiplier = currencies.includes(currency.toLowerCase()) ? 1 : 100;
  return Math.round(amount * multiplier);
};

export const parseStripeAmount = (
  amount: number,
  currency: string = "usd",
): number => {
  const currencies = [
    "jpy",
    "bif",
    "clp",
    "djf",
    "gnf",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "ugx",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
  ];
  const divisor = currencies.includes(currency.toLowerCase()) ? 1 : 100;
  return amount / divisor;
};
