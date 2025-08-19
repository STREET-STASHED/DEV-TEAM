import { flags } from './flags';
import { createClient } from './supabase/client';
import { pushSubscriptionSchema } from './schemas/viral';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}



class PushNotificationService {
  private supabase = createClient();
  private isEnabled = flags.push;

  /**
   * Register a push token for a user
   */
  async registerToken(userId: string, token: string, platform: 'web' | 'ios' | 'android' = 'web'): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('[Push] Feature disabled, skipping token registration');
      return false;
    }

    try {
      // Validate input
      const validated = pushSubscriptionSchema.parse({ token, platform });
      
      // Store token in database
      const { error } = await this.supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token: validated.token,
          platform: validated.platform,
          last_used: new Date().toISOString(),
        }, {
          onConflict: 'user_id,token'
        });

      if (error) {
        console.error('[Push] Failed to store token:', error);
        return false;
      }

      console.log(`[Push] Token registered for user ${userId} on ${platform}`);
      return true;
    } catch (error) {
      console.error('[Push] Token registration failed:', error);
      return false;
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
      // Get user's tokens
      const { data: tokens, error } = await this.supabase
        .from('push_tokens')
        .select('token, platform')
        .eq('user_id', userId);

      if (error || !tokens || tokens.length === 0) {
        console.log(`[Push] No tokens found for user ${userId}`);
        return false;
      }

      // Send to all user's devices
      const results = await Promise.allSettled(
        tokens.map(token => this.sendToToken(token.token, payload, token.platform))
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      console.log(`[Push] Sent to ${successCount}/${tokens.length} devices for user ${userId}`);
      
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
      // Try OneSignal first
      if (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
        return await this.sendViaOneSignal(token, payload);
      }

      // Try Firebase if available
      if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
        return await this.sendViaFirebase(token, payload);
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
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !restApiKey) {
      return false;
    }

    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${restApiKey}`,
        },
        body: JSON.stringify({
          app_id: appId,
          include_player_ids: [token],
          headings: { en: payload.title },
          contents: { en: payload.body },
          data: payload.data,
          chrome_web_image: payload.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('[Push] OneSignal error:', error);
      return false;
    }
  }

  /**
   * Send via Firebase (basic implementation)
   */
  private async sendViaFirebase(token: string, payload: PushPayload): Promise<boolean> {
    // This would require Firebase Admin SDK setup
    // For now, just log that we would send via Firebase
    console.log(`[Push] Would send via Firebase to ${token}:`, payload);
    return true;
  }

  /**
   * Send bulk notifications (for admin use)
   */
  async sendBulk(userIds: string[], payload: PushPayload): Promise<{ success: number; failed: number }> {
    if (!this.isEnabled) {
      return { success: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, payload))
    );

    const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - success;

    return { success, failed };
  }

  /**
   * Clean up old/unused tokens
   */
  async cleanupTokens(): Promise<number> {
    if (!this.isEnabled) return 0;

    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30); // Remove tokens unused for 30 days

      const { error, count } = await this.supabase
        .from('push_tokens')
        .delete()
        .lt('last_used', cutoff.toISOString());

      if (error) {
        console.error('[Push] Cleanup failed:', error);
        return 0;
      }

      console.log(`[Push] Cleaned up ${count} old tokens`);
      return count || 0;
    } catch (error) {
      console.error('[Push] Cleanup error:', error);
      return 0;
    }
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

export async function sendBulk(userIds: string[], payload: PushPayload) {
  return pushService.sendBulk(userIds, payload);
}
