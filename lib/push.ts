import { flags } from './flags';
import { pushSubscriptionSchema } from './schemas/viral';

interface PushPayload {
  title: string;
  message: string;
  data?: Record<string, string>;
  imageUrl?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  tag?: string;
  renotify?: boolean;
  badge?: string;
  icon?: string;
  vibrate?: number[];
}

interface NotificationPreferences {
  order_updates: boolean;
  payment_notifications: boolean;
  delivery_updates: boolean;
  promotional: boolean;
  chat_messages: boolean;
  system_alerts: boolean;
}

class PushNotificationService {
  private isEnabled = flags.push;
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  private oneSignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'os_v2_app_zzzopt36yzfvpfuoedf7457n25mztb732xhu5lfucbb3yt2aa7wfginxj4bgnbzpefermdtkddbxmcg3dysbajcfpvwndji6ktskfwq';
  private supported = 'serviceWorker' in navigator && 'PushManager' in window;

  /**
   * Register a push token for a user
   */
  async registerToken(userId: string, token: string, platform: 'web' | 'ios' | 'android' = 'web'): Promise<boolean> {
    if (!this.isEnabled || !this.supported) {
      console.log('[Push] Feature disabled or not supported, skipping token registration');
      return false;
    }

    try {
      // Validate input
      pushSubscriptionSchema.parse({ token, platform });

      // Store token in database
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform })
      });

      if (!response.ok) {
        throw new Error('Failed to register token');
      }

      console.log(`[Push] Token registered for user ${userId} on ${platform}`);
      return true;
    } catch (error) {
      console.error('[Push] Token registration failed:', error);
      return false;
    }
  }

  /**
   * Request notification permission and register service worker
   */
  async requestPermission(): Promise<boolean> {
    if (!this.supported) {
      console.log('[Push] Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.registerServiceWorker();
        return true;
      } else {
        console.log('[Push] Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Register service worker for push notifications
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Push] Service Worker registered:', registration);

      // Subscribe to push notifications
      await this.subscribeToPush(registration);
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPush(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey || '')
        });
      }

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: JSON.stringify(subscription),
          platform: 'web'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to push notifications');
      }

      console.log('[Push] Successfully subscribed to push notifications');
    } catch (error) {
      console.error('[Push] Push subscription failed:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('[Push] Feature disabled, skipping notification');
      return false;
    }

    try {
      // Check user notification preferences
      const preferences = await this.getUserNotificationPreferences(userId);
      if (!this.shouldSendNotification(payload, preferences)) {
        console.log('[Push] Notification blocked by user preferences');
        return false;
      }

      // Get user's push tokens
      const tokens = await this.getUserPushTokens(userId);

      if (tokens.length === 0) {
        console.log('[Push] No push tokens found for user');
        return false;
      }

      // Send to all tokens
      const results = await Promise.allSettled(
        tokens.map(token => this.sendToToken(token, payload, 'web'))
      );

      const successCount = results.filter(result =>
        result.status === 'fulfilled' && result.value
      ).length;

      console.log(`[Push] Sent notification to ${successCount}/${tokens.length} tokens`);
      return successCount > 0;
    } catch (error) {
      console.error('[Push] Failed to send to user:', error);
      return false;
    }
  }

  /**
   * Send push notification to a specific token
   */
  private async sendToToken(token: string, payload: PushPayload, platform: 'web' | 'ios' | 'android'): Promise<boolean> {
    try {
      // Try OneSignal first (using the provided app ID)
      if (this.oneSignalAppId) {
        return await this.sendViaOneSignal(token, payload);
      }

      // Try VAPID push (no external dependencies)
      if (this.vapidPublicKey) {
        return await this.sendViaVAPID(token, payload);
      }

      // Try Firebase if available (optional)
      try {
        if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
          return await this.sendViaFirebase(token, payload);
        }
      } catch (firebaseError) {
        console.log('[Push] Firebase not available, skipping:', firebaseError);
      }

      // Fallback: just log (for development)
      console.log(`[Push] No provider configured, would send to ${platform}:`, payload);
      return true;
    } catch (error) {
      console.error(`[Push] Failed to send to ${platform} token:`, error);
      return false;
    }
  }

  /**
   * Send via OneSignal
   */
  private async sendViaOneSignal(token: string, payload: PushPayload): Promise<boolean> {
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
        },
        body: JSON.stringify({
          app_id: this.oneSignalAppId,
          include_player_ids: [token],
          headings: { en: payload.title },
          contents: { en: payload.message },
          data: payload.data,
          url: payload.data?.url || '/',
          chrome_web_image: payload.imageUrl,
          chrome_web_icon: payload.icon || '/icons/icon-192x192.png',
          chrome_web_badge: payload.badge || '/icons/icon-192x192.png',
          chrome_web_actions: payload.actions?.map(action => ({
            id: action.action,
            name: action.title,
            icon: action.icon
          })),
          require_interaction: payload.requireInteraction || false,
          tags: payload.tag ? [payload.tag] : undefined,
          renotify: payload.renotify || false
        })
      });

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('[Push] OneSignal send failed:', error);
      return false;
    }
  }

  /**
   * Send via Firebase
   */
  private async sendViaFirebase(token: string, payload: PushPayload): Promise<boolean> {
    try {
      // Check if Firebase is properly configured
      if (!process.env.FIREBASE_SERVER_KEY) {
        console.log('[Push] Firebase server key not configured, skipping FCM');
        return false;
      }

      // Prepare FCM message
      const fcmMessage = {
        to: token,
        notification: {
          title: payload.title,
          body: payload.message,
          icon: payload.icon || '/icons/icon-192x192.png',
          badge: payload.badge || '/icons/icon-192x192.png',
          image: payload.imageUrl,
          click_action: payload.data?.url || '/',
          tag: payload.tag || 'default'
        },
        data: {
          ...payload.data,
          click_action: payload.data?.url || '/',
          icon: payload.icon || '/icons/icon-192x192.png',
          badge: payload.badge || '/icons/icon-192x192.png'
        },
        android: {
          notification: {
            icon: payload.icon || '/icons/icon-192x192.png',
            color: '#FFD700', // Gold color for StreetStashed
            priority: 'high',
            default_sound: true,
            default_vibrate_timings: true
          },
          data: payload.data
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: payload.title,
                body: payload.message
              },
              badge: 1,
              sound: 'default',
              category: payload.data?.type || 'general'
            },
            custom_data: payload.data
          }
        },
        webpush: {
          notification: {
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/icon-192x192.png',
            image: payload.imageUrl,
            actions: payload.actions?.map(action => ({
              action: action.action,
              title: action.title,
              icon: action.icon
            })) || [],
            require_interaction: payload.requireInteraction || false,
            tag: payload.tag || 'default',
            renotify: payload.renotify || false,
            data: payload.data
          },
          fcm_options: {
            link: payload.data?.url || '/'
          }
        }
      };

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(fcmMessage)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firebase API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success === 1) {
        console.log('[Push] FCM notification sent successfully');
        return true;
      } else {
        console.error('[Push] FCM notification failed:', result);
        return false;
      }
    } catch (error) {
      console.error('[Push] Firebase send failed:', error);
      return false;
    }
  }

  /**
   * Send via VAPID
   */
  private async sendViaVAPID(token: string, payload: PushPayload): Promise<boolean> {
    try {
      // This would require a server-side implementation
      // For now, we'll just log the attempt
      console.log('[Push] VAPID push would be sent:', { token, payload });
      return true;
    } catch (error) {
      console.error('[Push] VAPID send failed:', error);
      return false;
    }
  }

  /**
   * Get user notification preferences
   */
  private async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await fetch(`/api/notifications/preferences/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('[Push] Failed to get user preferences:', error);
    }

    // Default preferences
    return {
      order_updates: true,
      payment_notifications: true,
      delivery_updates: true,
      promotional: false,
      chat_messages: true,
      system_alerts: true
    };
  }

  /**
   * Check if notification should be sent based on preferences
   */
  private shouldSendNotification(payload: PushPayload, preferences: NotificationPreferences): boolean {
    const data = payload.data || {};

    if (data.type === 'order_update' && !preferences.order_updates) return false;
    if (data.type === 'payment' && !preferences.payment_notifications) return false;
    if (data.type === 'delivery' && !preferences.delivery_updates) return false;
    if (data.type === 'promotional' && !preferences.promotional) return false;
    if (data.type === 'chat' && !preferences.chat_messages) return false;
    if (data.type === 'system' && !preferences.system_alerts) return false;

    return true;
  }

  /**
   * Get user's push tokens
   */
  private async getUserPushTokens(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/notifications/tokens/${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.tokens || [];
      }
    } catch (error) {
      console.error('[Push] Failed to get user tokens:', error);
    }

    return [];
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusNotification(userId: string, orderId: string, status: string, orderNumber: string): Promise<boolean> {
    const payload: PushPayload = {
      title: 'Order Update',
      message: `Your order #${orderNumber} status has been updated to ${status.replace('_', ' ')}`,
      data: {
        type: 'order_update',
        order_id: orderId,
        order_number: orderNumber,
        status: status
      },
      actions: [
        { action: 'view_order', title: 'View Order' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      tag: `order_${orderId}`,
      renotify: true
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentNotification(userId: string, orderId: string, amount: number, orderNumber: string): Promise<boolean> {
    const payload: PushPayload = {
      title: 'Payment Confirmed',
      message: `Payment of $${amount.toFixed(2)} confirmed for order #${orderNumber}`,
      data: {
        type: 'payment',
        order_id: orderId,
        order_number: orderNumber,
        amount: amount.toString()
      },
      actions: [
        { action: 'view_order', title: 'View Order' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      tag: `payment_${orderId}`,
      renotify: false
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Send delivery update notification
   */
  async sendDeliveryNotification(userId: string, orderId: string, status: string, orderNumber: string, driverName?: string): Promise<boolean> {
    let message = `Your order #${orderNumber} has been ${status.replace('_', ' ')}`;
    if (driverName && status === 'assigned_to_driver') {
      message = `${driverName} has been assigned to your order #${orderNumber}`;
    }

    const payload: PushPayload = {
      title: 'Delivery Update',
      message: message,
      data: {
        type: 'delivery',
        order_id: orderId,
        order_number: orderNumber,
        status: status,
        driver_name: driverName || ''
      },
      actions: [
        { action: 'view_order', title: 'Track Order' },
        { action: 'chat', title: 'Chat with Driver' }
      ],
      tag: `delivery_${orderId}`,
      renotify: true
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Send chat message notification
   */
  async sendChatNotification(userId: string, senderName: string, message: string, orderId?: string): Promise<boolean> {
    const payload: PushPayload = {
      title: `Message from ${senderName}`,
      message: message.length > 100 ? message.substring(0, 100) + '...' : message,
      data: {
        type: 'chat',
        sender_name: senderName,
        message: message,
        order_id: orderId || ''
      },
      actions: [
        { action: 'chat', title: 'Reply' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      tag: orderId ? `chat_${orderId}` : 'chat',
      renotify: true
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Send promotional notification
   */
  async sendPromotionalNotification(userId: string, title: string, message: string, url?: string): Promise<boolean> {
    const payload: PushPayload = {
      title,
      message,
      data: {
        type: 'promotional',
        url: url || '/'
      },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      tag: 'promotional',
      renotify: false
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Clean up expired or invalid tokens
   */
  async cleanupTokens(): Promise<number> {
    if (!this.isEnabled) return 0;

    try {
      const response = await fetch('/api/notifications/cleanup', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        return data.cleanedCount || 0;
      }
    } catch (error) {
      console.error('[Push] Token cleanup failed:', error);
    }

    return 0;
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return this.supported && this.isEnabled;
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus(): Promise<NotificationPermission> {
    if (!this.supported) return 'denied';
    return Notification.permission;
  }

  /**
   * Get OneSignal app ID
   */
  getOneSignalAppId(): string {
    return this.oneSignalAppId;
  }
}

// Export singleton instance
export const pushService = new PushNotificationService();

// Convenience functions
export async function registerToken(userId: string, token: string, platform?: 'web' | 'ios' | 'android') {
  return pushService.registerToken(userId, token, platform);
}

export async function sendToUser(userId: string, payload: PushPayload) {
  return pushService.sendToUser(userId, payload);
}

export async function requestPermission() {
  return pushService.requestPermission();
}

export async function sendOrderStatusNotification(userId: string, orderId: string, status: string, orderNumber: string) {
  return pushService.sendOrderStatusNotification(userId, orderId, status, orderNumber);
}

export async function sendPaymentNotification(userId: string, orderId: string, amount: number, orderNumber: string) {
  return pushService.sendPaymentNotification(userId, orderId, amount, orderNumber);
}

export async function sendDeliveryNotification(userId: string, orderId: string, status: string, orderNumber: string, driverName?: string) {
  return pushService.sendDeliveryNotification(userId, orderId, status, orderNumber, driverName);
}

export async function sendChatNotification(userId: string, senderName: string, message: string, orderId?: string) {
  return pushService.sendChatNotification(userId, senderName, message, orderId);
}
