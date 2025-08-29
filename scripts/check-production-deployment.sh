#!/bin/bash

# Check Production Deployment Status
echo "🚀 Checking StreetStashed Production Deployment Status..."
echo "=================================================="

PRODUCTION_URL="https://streetstashed-web-git-master-street-stasheds-projects.vercel.app"

echo "📍 Production URL: $PRODUCTION_URL"
echo ""

# Check if main page is accessible
echo "🔍 Checking main page accessibility..."
if curl -s -f "$PRODUCTION_URL" > /dev/null; then
    echo "✅ Main page is accessible"
else
    echo "❌ Main page is not accessible"
fi

# Check if Firebase test page is accessible
echo "🔍 Checking Firebase test page..."
if curl -s -f "$PRODUCTION_URL/test-firebase" > /dev/null; then
    echo "✅ Firebase test page is accessible"
else
    echo "❌ Firebase test page is not accessible"
fi

# Check if Firebase API endpoint is accessible
echo "🔍 Checking Firebase API endpoint..."
if curl -s -f "$PRODUCTION_URL/api/firebase/send-notification" > /dev/null; then
    echo "✅ Firebase API endpoint is accessible"
else
    echo "❌ Firebase API endpoint is not accessible"
fi

# Check if service worker is accessible
echo "🔍 Checking Firebase service worker..."
if curl -s -f "$PRODUCTION_URL/firebase-messaging-sw.js" > /dev/null; then
    echo "✅ Firebase service worker is accessible"
else
    echo "❌ Firebase service worker is not accessible"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Visit Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Select your project: streetstashed-web"
echo "3. Go to Settings → Environment Variables"
echo "4. Add the Firebase environment variables from PRODUCTION_DEPLOYMENT_CHECKLIST.md"
echo "5. Redeploy if needed"
echo ""
echo "🧪 Test your deployment at: $PRODUCTION_URL/test-firebase"
