#!/bin/bash

# Test Stripe Production Configuration
echo "💳 Testing StreetStashed Stripe Production Configuration..."
echo "=========================================================="

PRODUCTION_URL="https://streetstashed-web-git-master-street-stasheds-projects.vercel.app"

echo "📍 Production URL: $PRODUCTION_URL"
echo ""

# Check if Stripe webhook endpoint is accessible
echo "🔍 Checking Stripe webhook endpoint..."
if curl -s -f "$PRODUCTION_URL/api/stripe/webhook" > /dev/null; then
    echo "✅ Stripe webhook endpoint is accessible"
else
    echo "❌ Stripe webhook endpoint is not accessible"
fi

# Test Stripe publishable key (this should be visible in page source)
echo "🔍 Checking Stripe publishable key in main page..."
STRIPE_KEY=$(curl -s "$PRODUCTION_URL" | grep -o 'pk_live_[a-zA-Z0-9]*' | head -1)
if [ ! -z "$STRIPE_KEY" ]; then
    echo "✅ Stripe publishable key found: $STRIPE_KEY"
else
    echo "❌ Stripe publishable key not found in page source"
fi

# Check if there are any Stripe-related JavaScript errors
echo "🔍 Checking for Stripe JavaScript errors..."
echo "   (This would require browser testing - check console for errors)"

echo ""
echo "📋 Stripe Production Checklist:"
echo "1. ✅ Live keys provided"
echo "2. ⚠️  Environment variables need to be set in Vercel"
echo "3. ⚠️  Webhook endpoint needs to be configured in Stripe Dashboard"
echo "4. ⚠️  Webhook secret needs to be added to Vercel"
echo ""
echo "🔧 Next Steps:"
echo "1. Add Stripe environment variables to Vercel dashboard"
echo "2. Configure webhook endpoint in Stripe Dashboard"
echo "3. Copy webhook secret to Vercel environment variables"
echo "4. Test payment flow with test cards"
echo ""
echo "📚 See STRIPE_PRODUCTION_SETUP.md for detailed instructions"
