# Push Notification Setup Guide

## OneSignal Configuration

### 1. App ID Configuration
Your OneSignal app ID has been automatically configured:
```
os_v2_app_zzzopt36yzfvpfuoedf7457n25mztb732xhu5lfucbb3yt2aa7wfginxj4bgnbzpefermdtkddbxmcg3dysbajcfpvwndji6ktskfwq
```

### 2. Required Environment Variables
Add these to your `.env.local` file:

```bash
# OneSignal Configuration
NEXT_PUBLIC_ONESIGNAL_APP_ID=os_v2_app_zzzopt36yzfvpfuoedf7457n25mztb732xhu5lfucbb3yt2aa7wfginxj4bgnbzpefermdtkddbxmctb732xhu5lfucbb3yt2aa7wfginxj4bgnbzpefermdtkddbxmcg3dysbajcfpvwndji6ktskfwq
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key_here

# VAPID Keys (Alternative to OneSignal)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BC8L0uazKTp_KTq0rjUg553rO7fkGGiIHDANq-DHbW6WRrPOH_-ZXf8ukLVhuQ9nFKjSBwIV49iFTf7SojS4_PY
VAPID_PRIVATE_KEY=FKSqb7XbXtweRgJWfDzmcPwgCxi_37FrvwgFDe_gRz8

# Real-time Features
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

### 3. Get Your OneSignal REST API Key
1. Go to [OneSignal Dashboard](https://app.onesignal.com/)
2. Navigate to Settings → Keys & IDs
3. Copy the "REST API Key"
4. Add it to your `.env.local` file

## Complete Environment Configuration

### Required Variables for Full Functionality:

```bash
# =====================================================
# DATABASE CONFIGURATION
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# =====================================================
# STRIPE PAYMENT PROCESSING
# =====================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# =====================================================
# PUSH NOTIFICATIONS - ONESIGNAL
# =====================================================
NEXT_PUBLIC_ONESIGNAL_APP_ID=os_v2_app_zzzopt36yzfvpfuoedf7457n25mztb732xhu5lfucbb3yt2aa7wfginxj4bgnbzpefermdtkddbxmcg3dysbajcfpvwndji6ktskfwq
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key_here

# =====================================================
# PUSH NOTIFICATIONS - VAPID (ALTERNATIVE)
# =====================================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BC8L0uazKTp_KTq0rjUg553rO7fkGGiIHDANq-DHbW6WRrPOH_-ZXf8ukLVhuQ9nFKjSBwIV49iFTf7SojS4_PY
VAPID_PRIVATE_KEY=FKSqb7XbXtweRgJWfDzmcPwgCxi_37FrvwgFDe_gRz8

# =====================================================
# REAL-TIME FEATURES
# =====================================================
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true

# =====================================================
# GOOGLE SERVICES
# =====================================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# =====================================================
# APPLICATION CONFIGURATION
# =====================================================
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NODE_ENV=production

# =====================================================
# SECURITY & ENCRYPTION
# =====================================================
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

## Testing Push Notifications

### 1. Test Notification Sending
```typescript
import { sendOrderStatusNotification } from '@/lib/push';

// Test order status notification
await sendOrderStatusNotification(
  'user-123',
  'order-456',
  'picked_up',
  'ORD-001'
);
```

### 2. Test Permission Request
```typescript
import { requestPermission } from '@/lib/push';

// Request notification permission
const granted = await requestPermission();
if (granted) {
  console.log('Push notifications enabled!');
}
```

### 3. Check Service Worker Registration
```typescript
// Check if service worker is registered
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.getRegistration();
  console.log('Service Worker:', registration);
}
```

## OneSignal Dashboard Setup

### 1. Configure Web Push Settings
1. Go to OneSignal Dashboard → Settings → Web Push
2. Set your website URL
3. Configure default notification settings
4. Set up notification icons

### 2. Configure Notification Templates
1. Create templates for different notification types:
   - Order Updates
   - Payment Confirmations
   - Delivery Updates
   - Chat Messages

### 3. Set Up Segments
1. Create user segments based on:
   - User type (buyer, seller, driver)
   - Notification preferences
   - Geographic location

## Troubleshooting

### Common Issues:

#### 1. Notifications Not Showing
- Check browser permission settings
- Verify service worker is registered
- Check OneSignal dashboard for errors
- Ensure environment variables are set correctly

#### 2. Service Worker Not Loading
- Check if `/sw.js` file exists in public folder
- Verify HTTPS is enabled (required for service workers)
- Check browser console for errors

#### 3. OneSignal API Errors
- Verify REST API key is correct
- Check app ID matches dashboard
- Ensure proper API permissions

### Debug Commands:
```typescript
// Check push service status
import { pushService } from '@/lib/push';

console.log('Push supported:', pushService.isSupported());
console.log('OneSignal App ID:', pushService.getOneSignalAppId());
console.log('Permission status:', await pushService.getPermissionStatus());
```

## Production Deployment

### 1. SSL/TLS Required
- Service workers require HTTPS
- WebSocket connections must use WSS
- Push notifications require secure context

### 2. Domain Configuration
- Update `NEXT_PUBLIC_FRONTEND_URL` with production domain
- Update `NEXT_PUBLIC_WEBSOCKET_URL` with production WebSocket endpoint
- Configure OneSignal with production domain

### 3. Monitoring
- Set up OneSignal analytics
- Monitor WebSocket connection health
- Track notification delivery rates
- Monitor user engagement metrics

## Security Considerations

### 1. API Key Protection
- Never expose REST API keys in client-side code
- Use environment variables for all sensitive data
- Implement proper authentication for notification endpoints

### 2. User Consent
- Always request permission before sending notifications
- Respect user notification preferences
- Provide easy opt-out mechanisms

### 3. Rate Limiting
- Implement rate limiting for notification sending
- Prevent abuse of notification system
- Monitor for unusual notification patterns

## Performance Optimization

### 1. Notification Batching
- Group similar notifications
- Use notification tags to prevent duplicates
- Implement smart notification timing

### 2. Service Worker Optimization
- Minimize service worker bundle size
- Implement efficient caching strategies
- Use background sync for offline actions

### 3. Database Optimization
- Index notification tables properly
- Implement notification cleanup jobs
- Use efficient queries for user preferences

## Next Steps

1. **Set up environment variables** with your actual API keys
2. **Test push notifications** in development environment
3. **Configure OneSignal dashboard** with your settings
4. **Deploy to production** with proper SSL configuration
5. **Monitor and optimize** based on user engagement

Your push notification system is now fully configured and ready to provide real-time updates to your users!
