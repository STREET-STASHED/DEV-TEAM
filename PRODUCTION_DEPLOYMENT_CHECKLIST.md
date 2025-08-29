# Production Deployment Checklist - Firebase Push Notifications

## 🚀 Deployment Status

✅ **Code Committed**: Firebase integration committed to master branch
✅ **Code Pushed**: Changes pushed to GitHub repository
🔄 **Vercel Deployment**: Automatic deployment in progress
⚠️ **Environment Variables**: Need to be configured in Vercel

## 📋 Required Vercel Environment Variables

To enable Firebase push notifications in production, you need to configure these environment variables in your Vercel dashboard:

### 1. Firebase Configuration
```bash
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC4Mx-v5Gv-j-R8q3tv9YZ9F3K9IDilsDI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=streetstashed-e1b7d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=streetstashed-e1b7d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=streetstashed-e1b7d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=718676028302
NEXT_PUBLIC_FIREBASE_APP_ID=1:718676028302:web:1592f15d4f3538b5ecd2df
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-W28L26BNMG
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BI_fDQvkzkgJVoV8BtNA6tfj7-FCRZ76E4eAfLnHwcMVOxApYSz9Nl8-gwLmJMpx05gyGmPnTbfe2QZ26s-HvtI
```

### 2. Firebase Admin SDK (for server-side notifications)
```bash
# You'll need to generate a service account key from Firebase Console
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"streetstashed-e1b7d",...}
```

### 3. Stripe Live Keys (Production)
```bash
# Stripe Publishable Key (Client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RVGJqJZXftPvY1jkg5b3mBQ4HEpDXLTrGZnLwPAk2uBFm6Dl9RljkrW16OHGvGZIbe5nQqClLMh3l7k365B43rW00lMEa3bd3

# Stripe Secret Key (Server-side only - NEVER expose to client)
STRIPE_SECRET_KEY=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

# Stripe Webhook Secret (from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_KlbQTGtCsT7rUXTsK5aZeIy1cb9tbPpN
```

### 4. Real-time Features
```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-production-websocket-url
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

## 🔧 How to Configure in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `streetstashed-web`

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables**

3. **Add Each Variable**
   - Click **Add New**
   - Enter the variable name and value
   - Select **Production** environment
   - Click **Save**

4. **Redeploy (if needed)**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment

## 🧪 Testing Production

Once deployed, test your Firebase integration at:
```
https://streetstashed-web-git-master-street-stasheds-projects.vercel.app/test-firebase
```

## 📱 Production Features

With Firebase configured in production, you'll have:
- ✅ Real-time push notifications
- ✅ Web app manifest for PWA installation
- ✅ Service worker for offline support
- ✅ Firebase Cloud Messaging
- ✅ Photo proof system for stashers
- ✅ Real-time order tracking

## 🚨 Important Notes

1. **VAPID Key**: Already configured in your code
2. **Service Account**: Required for server-side notifications
3. **HTTPS Required**: Vercel provides this automatically
4. **Domain Verification**: Firebase will work with your Vercel domain

## 🔍 Monitoring

Check your Vercel deployment logs for any build errors:
- Vercel Dashboard → Deployments → Latest Deployment → Functions Logs

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test locally first with `pnpm dev`
4. Check Firebase Console for any errors

---

**Status**: 🟢 **READY FOR DEPLOYMENT** - All environment variables provided
**Next Step**: Add environment variables to Vercel dashboard and redeploy
**Estimated Time**: 5-10 minutes for environment variable setup
