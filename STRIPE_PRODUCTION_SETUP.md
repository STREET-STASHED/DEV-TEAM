# Stripe Production Setup Guide

## 🚀 Overview

This guide will help you configure Stripe live keys for production and set up webhooks for your StreetStashed MVP.

## ⚠️ Security Warning

**NEVER commit these keys to your repository or share them publicly:**
- `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`
- `pk_live_51RVGJqJZXftPvY1jkg5b3mBQ4HEpDXLTrGZnLwPAk2uBFm6Dl9RljkrW16OHGvGZIbe5nQqClLMh3l7k365B43rW00lMEa3bd3`

## 🔑 Your Stripe Live Keys

### Publishable Key (Client-side)
```
pk_live_51RVGJqJZXftPvY1jkg5b3mBQ4HEpDXLTrGZnLwPAk2uBFm6Dl9RljkrW16OHGvGZIbe5nQqClLMh3l7k365B43rW00lMEa3bd3
```

### Secret Key (Server-side only)
```
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
```

## 📋 Required Vercel Environment Variables

Add these to your Vercel dashboard:

```bash
# Stripe Live Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RVGJqJZXftPvY1jkg5b3mBQ4HEpDXLTrGZnLwPAk2uBFm6Dl9RljkrW16OHGvGZIbe5nQqClLMh3l7k365B43rW00lMEa3bd3
STRIPE_SECRET_KEY=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

# Stripe Webhook Secret (from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_KlbQTGtCsT7rUXTsK5aZeIy1cb9tbPpN
```

## 🔧 Stripe Dashboard Configuration

### 1. Webhook Endpoint Setup

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Navigate to**: Developers → Webhooks
3. **Click**: "Add endpoint"
4. **Endpoint URL**: `https://streetstashed-web-git-master-street-stasheds-projects.vercel.app/api/stripe/webhook`
5. **Events to send**: Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.succeeded`
   - `charge.failed`
   - `charge.dispute.created`
   - `charge.refunded`
   - `account.updated`
   - `payout.paid`
   - `payout.failed`

6. **Copy the webhook secret** (starts with `whsec_`)
7. **Add it to Vercel**: `STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret`

### 2. Connected Accounts Setup

For marketplace functionality, you'll need to:

1. **Go to**: Stripe Dashboard → Connect → Settings
2. **Enable**: Custom accounts
3. **Configure**: Account requirements for sellers
4. **Set up**: Onboarding flow

### 3. Payment Methods

1. **Go to**: Stripe Dashboard → Settings → Payment methods
2. **Enable**: All payment methods you want to support
3. **Configure**: Regional settings for your target markets

## 🧪 Testing Production

### Test Payment Flow
1. Use Stripe's test card numbers in production mode
2. Test the complete order flow
3. Verify webhook delivery
4. Check database updates

### Test Cards for Production
```
# Success
4242 4242 4242 4242

# Decline
4000 0000 0000 0002

# Insufficient funds
4000 0000 0000 9995
```

## 📊 Monitoring

### Stripe Dashboard
- Monitor payments in real-time
- View webhook delivery logs
- Check for failed payments
- Monitor disputes and refunds

### Vercel Logs
- Check API function logs
- Monitor webhook processing
- Verify environment variables

## 🚨 Common Issues

### 1. Webhook Signature Verification Failed
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook endpoint URL
- Ensure webhook is active in Stripe

### 2. Payment Intent Creation Failed
- Verify `STRIPE_SECRET_KEY` is set
- Check account has sufficient funds
- Verify connected account setup

### 3. Client-side Errors
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify domain is allowed in Stripe
- Check browser console for errors

## 🔒 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** on all webhook requests
4. **Monitor for suspicious activity** in Stripe Dashboard
5. **Regularly rotate keys** if compromised
6. **Use HTTPS** for all production endpoints

## 📞 Support

### Stripe Support
- **Documentation**: https://stripe.com/docs
- **Support**: https://support.stripe.com/
- **Status**: https://status.stripe.com/

### Vercel Support
- **Documentation**: https://vercel.com/docs
- **Support**: https://vercel.com/support

---

**Status**: 🟢 **WEBHOOK CONFIGURED** - Keys and webhook secret provided
**Next Step**: Add environment variables to Vercel dashboard
**Estimated Time**: 5-10 minutes for environment variable setup
