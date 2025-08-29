import { Message, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { getFirebaseApp } from './config';

interface FirebasePushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, string>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  tag?: string;
  renotify?: boolean;
  vibrate?: number[];
}

class FirebasePushService {
  private messaging: any = null;
  private isInitialized = false;

  /**
   * Initialize Firebase messaging
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      const supported = await isSupported();
      if (!supported) {
        console.log('[Firebase Push] Messaging not supported in this environment');
        return false;
      }

      const app = getFirebaseApp();
      this.messaging = getMessaging(app);
      this.isInitialized = true;

      console.log('[Firebase Push] Messaging initialized successfully');
      return true;
    } catch (error) {
      console.error('[Firebase Push] Failed to initialize messaging:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('[Firebase Push] Notification permission granted');
        return true;
      } else {
        console.log('[Firebase Push] Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('[Firebase Push] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Get FCM token for the current user
   */
  async getToken(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.messaging) {
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: "BI_fDQvkzkgJVoV8BtNA6tfj7-FCRZ76E4eAfLnHwcMVOxApYSz9Nl8-gwLmJMpx05gyGmPnTbfe2QZ26s-HvtI"
      });

      if (token) {
        console.log('[Firebase Push] FCM token obtained:', token);
        return token;
      } else {
        console.log('[Firebase Push] No registration token available');
        return null;
      }
    } catch (error) {
      console.error('[Firebase Push] Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Handle foreground messages
   */
  onForegroundMessage(callback: (payload: Message) => void): (() => void) | null {
    try {
      if (!this.messaging) {
        console.warn('[Firebase Push] Messaging not initialized');
        return null;
      }

      return onMessage(this.messaging, (payload) => {
        console.log('[Firebase Push] Foreground message received:', payload);
        callback(payload);
      });
    } catch (error) {
      console.error('[Firebase Push] Failed to set up foreground message handler:', error);
      return null;
    }
  }

  /**
   * Send push notification to a specific FCM token
   */
  async sendToToken(token: string, payload: FirebasePushPayload): Promise<boolean> {
    try {
      // This would typically be done server-side
      // For now, we'll just log the attempt
      console.log('[Firebase Push] Attempting to send notification to token:', token);
      console.log('[Firebase Push] Payload:', payload);

      // In a real implementation, you would send this to your backend
      // which would then use Firebase Admin SDK to send the notification
      return true;
    } catch (error) {
      console.error('[Firebase Push] Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Send push notification to multiple tokens
   */
  async sendToTokens(tokens: string[], payload: FirebasePushPayload): Promise<boolean[]> {
    try {
      const results = await Promise.allSettled(
        tokens.map(token => this.sendToToken(token, payload))
      );

      return results.map(result =>
        result.status === 'fulfilled' ? result.value : false
      );
    } catch (error) {
      console.error('[Firebase Push] Failed to send to multiple tokens:', error);
      return tokens.map(() => false);
    }
  }

  /**
   * Check if Firebase push is supported
   */
  isSupported(): boolean {
    return this.isInitialized && !!this.messaging;
  }

  /**
   * Get messaging instance
   */
  getMessagingInstance() {
    return this.messaging;
  }
}

// Export singleton instance
export const firebasePushService = new FirebasePushService();

// Export individual functions for convenience
export const {
  initialize,
  requestPermission,
  getToken,
  onForegroundMessage,
  sendToToken,
  sendToTokens,
  isSupported
} = firebasePushService;

export default firebasePushService;
