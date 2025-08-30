# Vercel Environment Variables - Complete List

## 🚀 Production Environment Variables

Copy and paste these into your Vercel dashboard at:
**Settings** → **Environment Variables**

### 🔥 Firebase Configuration
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC4Mx-v5Gv-j-R8q3tv9YZ9F3K9IDilsDI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=streetstashed-e1b7d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=streetstashed-e1b7d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=streetstashed-e1b7d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=718676028302
NEXT_PUBLIC_FIREBASE_APP_ID=1:718676028302:web:1592f15d4f3538b5ecd2df
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-W28L26BNMG
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BI_fDQvkzkgJVoV8BtNA6tfj7-FCRZ76E4eAfLnHwcMVOxApYSz9Nl8-gwLmJMpx05gyGmPnTbfe2QZ26s-HvtI
```

### 💳 Stripe Live Keys
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RVGJqJZXftPvY1jkg5b3mBQ4HEpDXLTrGZnLwPAk2uBFm6Dl9RljkrW16OHGvGZIbe5nQqClLMh3l7k365B43rW00lMEa3bd3
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_KlbQTGtCsT7rUXTsK5aZeIy1cb9tbPpN
```

### 🌐 Real-time Features
```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-production-websocket-url
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

### 🔧 App Configuration
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

## 📋 How to Add in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `streetstashed-web`
3. **Go to Settings** → **Environment Variables**
4. **Click "Add New"** for each variable above
5. **Select "Production"** environment for all variables
6. **Click "Save"** after each one

## ✅ Verification Checklist

After adding all variables:

- [ ] Firebase configuration variables added
- [ ] Stripe live keys added
- [ ] Stripe webhook secret added
- [ ] Real-time features enabled
- [ ] Production environment set

## 🧪 Test After Configuration

1. **Redeploy** your project in Vercel
2. **Test Firebase**: Visit `/test-firebase` page
3. **Test Stripe**: Check webhook endpoint accessibility
4. **Monitor logs** for any errors

## 🚨 Important Notes

- **Never commit these values** to your repository
- **Keep your Stripe secret key secure** - it's server-side only
- **The webhook secret** is required for Stripe webhook verification
- **Firebase VAPID key** enables push notifications

---

**Status**: 🟢 **READY FOR DEPLOYMENT** - All environment variables provided
**Next Step**: Add these to Vercel dashboard and redeploy
**Estimated Time**: 5-10 minutes for setup
