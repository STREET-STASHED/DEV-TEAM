# 🚀 StreetStashed Production Deployment Guide

This guide walks you through deploying StreetStashed to production with all features enabled.

## 📋 **Prerequisites**

- ✅ StreetStashed MVP codebase
- ✅ Supabase project with production database
- ✅ Stripe account with production keys
- ✅ Google Cloud project with Maps API enabled
- ✅ Hosting platform account (Vercel, Netlify, AWS, etc.)

## 🔑 **Step 1: Environment Variables Setup**

### 1.1 Create Environment File

```bash
# Run the production setup script
./setup-production.sh
```

### 1.2 Configure Real API Keys

Edit `.env.local` and replace placeholder values:

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Production - Live Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Google Maps (Production)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYour-Google-Maps-API-Key

# Application URLs (Production)
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com

# Security (Generate strong keys)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 1.3 Generate Security Keys

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 24
```

## 💳 **Step 2: Stripe Production Setup**

### 2.1 Enable Live Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle from "Test mode" to "Live mode"
3. Complete business verification if required

### 2.2 Get Production Keys

1. Go to Developers → API keys
2. Copy your live publishable and secret keys
3. Update `.env.local` with live keys

### 2.3 Configure Webhooks

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
   - `account.updated`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook secret to `.env.local`

### 2.4 Test Webhooks (Optional)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🗺️ **Step 3: Google Maps Production Setup**

### 3.1 Enable Billing

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to Billing → Link a billing account
4. Add a credit card or billing account

### 3.2 Enable APIs

1. Go to APIs & Services → Library
2. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Directions API
   - Distance Matrix API

### 3.3 Create API Key

1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Copy the API key to `.env.local`

### 3.4 Restrict API Key (Recommended)

1. Click on your API key
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain: `https://your-domain.com/*`
3. Under "API restrictions":
   - Select "Restrict key"
   - Select only the APIs you enabled above

### 3.5 Set Quotas and Alerts

1. Go to APIs & Services → Quotas
2. Set reasonable limits for each API
3. Go to Billing → Budgets & alerts
4. Create budget alerts to monitor costs

## 🚀 **Step 4: Choose Hosting Platform**

### Option A: Vercel (Recommended for Next.js)

#### 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 4.2 Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### 4.3 Configure Environment Variables

1. Go to your project in Vercel dashboard
2. Go to Settings → Environment Variables
3. Add all variables from `.env.local`
4. Redeploy if needed

#### 4.4 Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Option B: Netlify

#### 4.1 Connect Repository

1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository

#### 4.2 Build Settings

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `18`

#### 4.3 Environment Variables

1. Go to Site settings → Environment variables
2. Add all variables from `.env.local`

### Option C: AWS Amplify

#### 4.1 Connect Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository

#### 4.2 Build Settings

Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

#### 4.3 Environment Variables

1. Go to Environment variables
2. Add all variables from `.env.local`

### Option D: Docker Deployment

#### 4.1 Build and Run

```bash
# Build the Docker image
docker build -t streetstashed .

# Run with Docker Compose
docker-compose up -d
```

#### 4.2 Production Server

1. Upload files to your server
2. Install Docker and Docker Compose
3. Run `docker-compose up -d`
4. Configure nginx reverse proxy

## 📊 **Step 5: Monitoring & Analytics Setup**

### 5.1 Error Tracking (Sentry)

1. Go to [Sentry](https://sentry.io)
2. Create a new project
3. Get your DSN
4. Add to `.env.local`:
   ```bash
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

### 5.2 Performance Monitoring

1. **Vercel Analytics** (if using Vercel):
   - Automatically enabled
   - View in Vercel dashboard

2. **Custom Monitoring**:
   - Already implemented in `lib/monitoring.ts`
   - Data sent to `/api/monitoring/*` endpoints

### 5.3 Uptime Monitoring

1. **UptimeRobot** (Free):
   - Go to [UptimeRobot](https://uptimerobot.com)
   - Add your domain
   - Set check interval (5 minutes)

2. **Pingdom** (Paid):
   - More advanced features
   - Better alerting

### 5.4 Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property
3. Get your tracking ID
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_GA_TRACKING_ID=G-ABC123...
   ```

## 🔒 **Step 6: Security & SSL**

### 6.1 SSL Certificate

- **Vercel/Netlify**: Automatically handled
- **Custom server**: Use Let's Encrypt or your hosting provider's SSL

### 6.2 Security Headers

Already configured in:

- `vercel.json` (Vercel)
- `netlify.toml` (Netlify)
- `nginx.conf` (Docker)

### 6.3 Rate Limiting

- API endpoints: 10 requests/second
- Login endpoints: 5 requests/minute
- Configured in nginx and API middleware

## 🧪 **Step 7: Testing Production**

### 7.1 Integration Test

1. Visit: `https://your-domain.com/test-integration`
2. Verify all features work:
   - ✅ Google Maps loading
   - ✅ WebSocket connections
   - ✅ GPS tracking
   - ✅ Stripe payment forms

### 7.2 Payment Testing

1. Use Stripe test cards in test mode
2. Switch to live mode for real payments
3. Test webhook delivery

### 7.3 Performance Testing

1. Use [Lighthouse](https://developers.google.com/web/tools/lighthouse)
2. Check Core Web Vitals
3. Monitor API response times

## 📈 **Step 8: Post-Deployment**

### 8.1 Monitor Logs

```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Docker
docker-compose logs -f app
```

### 8.2 Set Up Alerts

1. **Error rate alerts**: >5% error rate
2. **Performance alerts**: LCP >2.5s
3. **Uptime alerts**: <99.9% uptime

### 8.3 Backup Strategy

1. **Database**: Supabase automatic backups
2. **Code**: GitHub repository
3. **Environment**: Document all variables

## 🚨 **Troubleshooting**

### Common Issues:

1. **"API key not found"**
   - Check environment variable names
   - Ensure variables are set in hosting platform

2. **"Webhook signature verification failed"**
   - Verify webhook secret in Stripe dashboard
   - Check webhook URL is correct

3. **"Google Maps not loading"**
   - Verify API key is correct
   - Check API restrictions and quotas
   - Ensure billing is enabled

4. **"Stripe payment failed"**
   - Verify live keys are being used
   - Check webhook endpoint is accessible
   - Verify account verification status

### Debug Mode:

```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG_MODE=true
```

## 🎉 **Success Checklist**

- ✅ Environment variables configured
- ✅ Stripe webhooks working
- ✅ Google Maps loading
- ✅ App deployed to hosting platform
- ✅ SSL certificate active
- ✅ Monitoring configured
- ✅ Integration tests passing
- ✅ Payment processing working
- ✅ Real-time features functional

## 📞 **Support & Resources**

- **Documentation**: `ENVIRONMENT_SETUP.md`
- **Monitoring**: `lib/monitoring.ts`
- **Test Page**: `/test-integration`
- **Production Script**: `./setup-production.sh`

---

**🚀 Congratulations! StreetStashed is now running in production with all features enabled!**

Your app now has:

- 🗺️ **Real Google Maps integration**
- 🔌 **WebSocket real-time updates**
- 📍 **GPS tracking system**
- 💳 **Stripe payment processing**
- 🔐 **Production authentication**
- 📊 **Comprehensive monitoring**
- 🚀 **Production deployment**
