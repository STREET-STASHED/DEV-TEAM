# Firebase Push Notifications Setup Guide

## Overview
This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in your StreetStashed MVP application.

## What's Already Configured

✅ **Firebase SDK** - Installed and configured
✅ **Firebase Config** - Your project configuration is set up
✅ **VAPID Key** - Web push certificate configured
✅ **Service Worker** - Firebase messaging service worker configured
✅ **Client Library** - Firebase push service implemented
✅ **API Endpoint** - Server-side notification sending endpoint
✅ **Test Component** - Test page for verification

## Current Firebase Configuration

Your Firebase project is configured with:
- **Project ID**: `streetstashed-e1b7d`
- **API Key**: `AIzaSyC4Mx-v5Gv-j-R8q3tv9YZ9F3K9IDilsDI`
- **Auth Domain**: `streetstashed-e1b7d.firebaseapp.com`
- **Storage Bucket**: `streetstashed-e1b7d.firebasestorage.app`
- **Messaging Sender ID**: `718676028302`
- **App ID**: `1:718676028302:web:1592f15d4f3538b5ecd2df`
- **Measurement ID**: `G-W28L26BNMG`

## Next Steps Required

### 1. ✅ VAPID Key Configured

Your VAPID key has been configured:
```
BI_fDQvkzkgJVoV8BtNA6tfj7-FCRZ76E4eAfLnHwcMVOxApYSz9Nl8-gwLmJMpx05gyGmPnTbfe2QZ26s-HvtI
```

### 2. Test Your Setup

Your Firebase push notifications are now fully configured! Test them by:

1. **Start Development Server**: `pnpm dev`
2. **Navigate to Test Page**: `http://localhost:3000/test-firebase`
3. **Test Flow**:
   - Check Firebase support
   - Request notification permission
   - Get FCM token
   - Send test notification

### 3. Set Up Firebase Admin SDK (Production)

For production, you'll need to set up Firebase Admin SDK credentials:

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Set the environment variable:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/serviceAccountKey.json
   ```

## Testing Your Setup

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Navigate to Test Page
Visit: `http://localhost:3000/test-firebase`

### 3. Test Flow
1. **Check Support** - Verify Firebase is supported in your browser
2. **Request Permission** - Grant notification permissions
3. **Get FCM Token** - Generate a Firebase Cloud Messaging token
4. **Send Test Notification** - Test the complete flow

## How It Works

### Client-Side (Browser)
1. **Initialization**: Firebase app initializes with your config
2. **Permission**: User grants notification permission
3. **Token Generation**: FCM token is generated for the user
4. **Service Worker**: Handles background notifications
5. **Foreground Messages**: Handles notifications when app is open

### Server-Side (API)
1. **Receive Request**: API endpoint receives notification request
2. **Firebase Admin**: Uses Admin SDK to send via FCM
3. **Delivery**: FCM delivers to user's browser/device
4. **Display**: Browser shows notification to user

## Integration with Existing System

Your Firebase push notifications integrate with:

- **Real-time Order Tracking** - Order status updates
- **Payment Confirmations** - Payment success/failure
- **Delivery Updates** - Driver location and status
- **Chat Messages** - Real-time messaging
- **System Alerts** - Important notifications

## Production Deployment

### 1. Environment Variables
```bash
# Production Firebase
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_production_vapid_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/production/serviceAccountKey.json

# Production URLs
NEXT_PUBLIC_WEBSOCKET_URL=wss://yourdomain.com
NEXT_PUBLIC_APP_ENV=production
```

### 2. SSL/TLS Required
- HTTPS is required for service workers
- WSS (secure WebSocket) for real-time features
- Secure context for push notifications

### 3. Domain Configuration
- Update Firebase Console with production domain
- Configure authorized domains
- Set up custom domain if needed

## Troubleshooting

### Common Issues

#### 1. "Firebase not supported"
- Check if you're using HTTPS in production
- Verify browser compatibility
- Check console for initialization errors

#### 2. "Permission denied"
- User must manually grant permission
- Check browser notification settings
- Verify service worker registration

#### 3. "No FCM token"
- Check VAPID key configuration
- Verify Firebase project settings
- Check console for token generation errors

#### 4. "Notifications not showing"
- Check service worker registration
- Verify notification permissions
- Check browser notification settings

### Debug Commands

```typescript
// Check Firebase status
import { firebasePushService } from '@/lib/firebase/push';

console.log('Supported:', firebasePushService.isSupported());
console.log('Initialized:', firebasePushService.getMessagingInstance());

// Check service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then(reg => {
    console.log('Service Worker:', reg);
  });
}
```

## Security Considerations

### 1. API Key Protection
- Firebase API keys are safe to expose (they're public)
- VAPID keys are also public
- Admin SDK credentials must be kept secret

### 2. User Consent
- Always request permission before sending
- Respect user preferences
- Provide easy opt-out

### 3. Rate Limiting
- Implement rate limiting on notification endpoints
- Prevent abuse of notification system
- Monitor for unusual patterns

## Performance Optimization

### 1. Token Management
- Store FCM tokens in database
- Update tokens when they refresh
- Clean up invalid tokens

### 2. Notification Batching
- Group similar notifications
- Use tags to prevent duplicates
- Implement smart timing

### 3. Service Worker
- Minimize service worker size
- Efficient caching strategies
- Background sync for offline actions

## Monitoring and Analytics

### 1. Firebase Analytics
- Track notification delivery rates
- Monitor user engagement
- Analyze notification performance

### 2. Custom Metrics
- Track permission grant rates
- Monitor token generation success
- Log notification delivery status

### 3. Error Tracking
- Log failed notifications
- Track permission denials
- Monitor service worker errors

## Next Steps

1. **Generate VAPID key** in Firebase Console
2. **Set environment variables** with your VAPID key
3. **Test the integration** using the test page
4. **Deploy to production** with proper SSL configuration
5. **Monitor performance** and user engagement

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify Firebase Console configuration
3. Test with the provided test page
4. Check environment variable configuration
5. Ensure HTTPS is enabled in production

Your Firebase push notification system is now fully configured and ready to provide real-time updates to your users!
