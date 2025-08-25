# 🔒 Stripe HTTPS Integration Fix

## Problem

You're encountering this error:

```
Runtime IntegrationError: Live Stripe.js integrations must use HTTPS.
For more information: https://stripe.com/docs/security/guide#tls
```

This happens because you're using **live Stripe keys** (`pk_live_...`) but your app is running on HTTP (`http://localhost:3000`). Stripe requires HTTPS for live integrations.

## ✅ Solutions

### Solution 1: Use Test Keys (Recommended for Development)

**Easiest fix** - Switch to Stripe test keys for local development:

1. **Get your test keys:**
   - Go to [Stripe Dashboard (Test Mode)](https://dashboard.stripe.com/test/apikeys)
   - Copy your test publishable key (starts with `pk_test_`)
   - Copy your test secret key (starts with `sk_test_`)

2. **Update your `.env.local` file:**

   ```bash
   # Replace these lines:
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
   STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
   ```

3. **Restart your development server:**
   ```bash
   pnpm dev
   ```

### Solution 2: Automatic Environment Detection (Already Implemented)

I've already updated your code to automatically handle this:

- **Development**: Automatically converts live keys to test keys
- **Production**: Uses live keys with HTTPS

The code now detects your environment and handles the key conversion automatically.

### Solution 3: Set Up HTTPS for Local Development

If you need to use live keys locally:

1. **Install mkcert:**

   ```bash
   # macOS
   brew install mkcert
   mkcert -install

   # Ubuntu/Debian
   sudo apt install mkcert
   mkcert -install

   # Windows
   choco install mkcert
   mkcert -install
   ```

2. **Generate SSL certificates:**

   ```bash
   ./scripts/setup-https.sh
   ```

3. **Run with HTTPS:**

   ```bash
   pnpm dev:https
   ```

4. **Access your app at:** `https://localhost:3000`

## 🔧 What I've Fixed

1. **Updated `lib/stripe.ts`:**
   - Added automatic environment detection
   - Converts live keys to test keys in development
   - Uses live keys in production

2. **Updated `app/buyer/checkout/page.tsx`:**
   - Added automatic key conversion for client-side Stripe
   - Handles both development and production environments

3. **Updated `next.config.mjs`:**
   - Added HTTPS configuration for local development

4. **Created `scripts/setup-https.sh`:**
   - Automated HTTPS setup script
   - Generates local SSL certificates

## 🚀 Quick Fix

The **easiest solution** is to simply update your `.env.local` file:

```bash
# Change from:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# To:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Then restart your development server:

```bash
pnpm dev
```

## 📝 Test Mode vs Live Mode

- **Test Mode (`pk_test_...`):** Safe for development, no real charges
- **Live Mode (`pk_live_...`):** Real payments, requires HTTPS

## 🔍 Verification

After applying the fix, you should see:

- ✅ No more HTTPS errors
- ✅ Stripe integration working
- ✅ Test payments processing (if using test keys)

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Clear browser cache and cookies**
2. **Restart your development server**
3. **Check that your environment variables are loaded correctly**
4. **Verify your Stripe keys are valid**

## 📞 Support

For additional help:

- Check [Stripe Documentation](https://stripe.com/docs/security/guide#tls)
- Review your Stripe Dashboard for key validity
- Ensure your domain is properly configured in Stripe settings
