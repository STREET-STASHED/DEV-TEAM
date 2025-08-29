import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { pushService } from '@/lib/push';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge, supabase);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge, supabase);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute, supabase);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge, supabase);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account, supabase);
        break;

      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout, supabase);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout, supabase);
        break;

      case 'setup_intent.created':
        await handleSetupIntentCreated(event.data.object as Stripe.SetupIntent, supabase);
        break;

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent, supabase);
        break;

      case 'setup_intent.canceled':
        await handleSetupIntentCanceled(event.data.object as Stripe.SetupIntent, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const { orderId, buyerId, sellerId } = paymentIntent.metadata;

  if (!orderId) {
    console.error('Payment intent missing orderId metadata');
    return;
  }

  try {
    // Update order status to 'paid'
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'paid',
        payment_intent_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('Failed to update order status:', orderError);
      return;
    }

    // Add to order status history
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: 'paid',
        notes: 'Payment confirmed via Stripe',
        metadata: {
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency
        }
      });

    // Create notification for buyer
    if (buyerId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: buyerId,
          type: 'payment_success',
          title: 'Payment Confirmed',
          message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} has been confirmed.`,
          data: { order_id: orderId, amount: paymentIntent.amount / 100 }
        });

      // Send push notification
      await pushService.sendToUser(buyerId, {
        title: 'Payment Confirmed',
        message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} has been confirmed.`,
        data: { order_id: orderId, type: 'payment_success' }
      });
    }

    // Create notification for seller
    if (sellerId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: sellerId,
          type: 'order_paid',
          title: 'Order Payment Received',
          message: `Payment received for order ${orderId}.`,
          data: { order_id: orderId, amount: paymentIntent.amount / 100 }
        });
    }

    console.log(`Payment succeeded for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const { orderId, buyerId } = paymentIntent.metadata;

  if (!orderId) return;

  try {
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'payment_failed',
        payment_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // Add to order status history
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: 'payment_failed',
        notes: 'Payment failed via Stripe',
        metadata: {
          payment_intent_id: paymentIntent.id,
          failure_reason: paymentIntent.last_payment_error?.message || 'Unknown error'
        }
      });

    // Notify buyer
    if (buyerId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: buyerId,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again.',
          data: { order_id: orderId }
        });

      await pushService.sendToUser(buyerId, {
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
        data: { order_id: orderId, type: 'payment_failed' }
      });
    }

    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const { orderId, buyerId } = paymentIntent.metadata;

  if (!orderId) return;

  try {
    await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // Add to order status history
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: 'cancelled',
        notes: 'Payment cancelled by user or system',
        metadata: { payment_intent_id: paymentIntent.id }
      });

    // Notify buyer
    if (buyerId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: buyerId,
          type: 'payment_cancelled',
          title: 'Payment Cancelled',
          message: 'Your payment has been cancelled.',
          data: { order_id: orderId }
        });
    }

    console.log(`Payment cancelled for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

async function handleChargeSucceeded(charge: Stripe.Charge, supabase: any) {
  // Handle successful charge (additional to payment intent)
  console.log(`Charge succeeded: ${charge.id}`);
}

async function handleChargeFailed(charge: Stripe.Charge, supabase: any) {
  // Handle failed charge
  console.log(`Charge failed: ${charge.id}`);
}

async function handleDisputeCreated(dispute: Stripe.Dispute, supabase: any) {
  try {
    // Get the charge and order details
    const charge = await stripe.charges.retrieve(dispute.charge as string);
    const { orderId, buyerId, sellerId } = charge.metadata;

    if (orderId) {
      // Update order status
      await supabase
        .from('orders')
        .update({
          status: 'disputed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      // Add to order status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: 'disputed',
          notes: `Payment dispute created: ${dispute.reason}`,
          metadata: {
            dispute_id: dispute.id,
            reason: dispute.reason,
            amount: dispute.amount / 100
          }
        });

      // Notify buyer and seller
      if (buyerId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: buyerId,
            type: 'dispute_created',
            title: 'Payment Dispute Created',
            message: 'A dispute has been created for your payment.',
            data: { order_id: orderId, dispute_id: dispute.id }
          });
      }

      if (sellerId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: sellerId,
            type: 'dispute_created',
            title: 'Payment Dispute Created',
            message: 'A dispute has been created for an order payment.',
            data: { order_id: orderId, dispute_id: dispute.id }
          });
      }
    }

    console.log(`Dispute created: ${dispute.id}`);
  } catch (error) {
    console.error('Error handling dispute creation:', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge, supabase: any) {
  const { orderId, buyerId, sellerId } = charge.metadata;

  if (!orderId) return;

  try {
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'refunded',
        payment_status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // Add to order status history
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: 'refunded',
        notes: 'Payment refunded via Stripe',
        metadata: {
          charge_id: charge.id,
          refund_amount: charge.amount_refunded / 100
        }
      });

    // Notify buyer
    if (buyerId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: buyerId,
          type: 'payment_refunded',
          title: 'Payment Refunded',
          message: `Your payment of $${(charge.amount_refunded / 100).toFixed(2)} has been refunded.`,
          data: { order_id: orderId, refund_amount: charge.amount_refunded / 100 }
        });

      await pushService.sendToUser(buyerId, {
        title: 'Payment Refunded',
        message: `Your payment of $${(charge.amount_refunded / 100).toFixed(2)} has been refunded.`,
        data: { order_id: orderId, type: 'payment_refunded' }
      });
    }

    // Notify seller
    if (sellerId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: sellerId,
          type: 'payment_refunded',
          title: 'Payment Refunded',
          message: `A payment for order ${orderId} has been refunded.`,
          data: { order_id: orderId, refund_amount: charge.amount_refunded / 100 }
        });
    }

    console.log(`Payment refunded for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment refund:', error);
  }
}

async function handleAccountUpdated(account: Stripe.Account, supabase: any) {
  try {
    // Update seller verification status
    await supabase
      .from('seller_profiles')
      .update({
        stripe_account_id: account.id,
        stripe_account_status: account.charges_enabled ? 'active' : 'pending',
        verification_status: account.requirements?.currently_due?.length === 0 ? 'verified' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_account_id', account.id);

    console.log(`Account updated: ${account.id}`);
  } catch (error) {
    console.error('Error handling account update:', error);
  }
}

async function handlePayoutPaid(payout: Stripe.Payout, supabase: any) {
  try {
    // Log successful payout
    await supabase
      .from('payouts')
      .insert({
        stripe_payout_id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: 'paid',
        paid_at: new Date(payout.arrival_date * 1000).toISOString(),
        metadata: {
          destination: payout.destination,
          method: payout.method
        }
      });

    console.log(`Payout paid: ${payout.id}`);
  } catch (error) {
    console.error('Error handling payout paid:', error);
  }
}

async function handlePayoutFailed(payout: Stripe.Payout, supabase: any) {
  try {
    // Log failed payout
    await supabase
      .from('payouts')
      .insert({
        stripe_payout_id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: 'failed',
        failed_at: new Date().toISOString(),
        metadata: {
          destination: payout.destination,
          method: payout.method,
          failure_reason: payout.failure_code
        }
      });

    console.log(`Payout failed: ${payout.id}`);
  } catch (error) {
    console.error('Error handling payout failed:', error);
  }
}

async function handleSetupIntentCreated(setupIntent: Stripe.SetupIntent, supabase: any) {
  try {
    const { customerId, metadata } = setupIntent;

    if (customerId) {
      // Log setup intent creation
      await supabase
        .from('payment_setups')
        .insert({
          stripe_setup_intent_id: setupIntent.id,
          customer_id: customerId,
          status: 'created',
          created_at: new Date(setupIntent.created * 1000).toISOString(),
          metadata: {
            payment_method_types: setupIntent.payment_method_types,
            usage: setupIntent.usage,
            ...metadata
          }
        });

      console.log(`Setup intent created: ${setupIntent.id} for customer: ${customerId}`);
    }
  } catch (error) {
    console.error('Error handling setup intent created:', error);
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent, supabase: any) {
  try {
    const { customerId, metadata } = setupIntent;

    if (customerId) {
      // Update setup intent status to succeeded
      await supabase
        .from('payment_setups')
        .update({
          status: 'succeeded',
          succeeded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_setup_intent_id', setupIntent.id);

      // Create notification for customer
      await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          type: 'payment_method_saved',
          title: 'Payment Method Saved',
          message: 'Your payment method has been successfully saved for future use.',
          data: {
            setup_intent_id: setupIntent.id,
            payment_method_types: setupIntent.payment_method_types
          }
        });

      console.log(`Setup intent succeeded: ${setupIntent.id} for customer: ${customerId}`);
    }
  } catch (error) {
    console.error('Error handling setup intent succeeded:', error);
  }
}

async function handleSetupIntentCanceled(setupIntent: Stripe.SetupIntent, supabase: any) {
  try {
    const { customerId } = setupIntent;

    if (customerId) {
      // Update setup intent status to canceled
      await supabase
        .from('payment_setups')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_setup_intent_id', setupIntent.id);

      console.log(`Setup intent canceled: ${setupIntent.id} for customer: ${customerId}`);
    }
  } catch (error) {
    console.error('Error handling setup intent canceled:', error);
  }
}
