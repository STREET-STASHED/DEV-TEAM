import { flags } from './flags';
import { supabase } from './supabase/client';
import { analyticsEventSchema, type AnalyticsEvent } from './schemas/viral';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null;
}

export interface TrackedEvent extends AnalyticsEvent {
  timestamp: string;
  sessionId?: string;
  pageUrl?: string;
  userAgent?: string;
}

class AnalyticsService {
  private isEnabled = flags.analytics;
  private sessionId: string | null = null;
  private queue: TrackedEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSession();
    this.startPeriodicFlush();
  }

  /**
   * Initialize session tracking
   */
  private initializeSession(): void {
    if (typeof window === 'undefined') return;

    // Generate or retrieve session ID
    this.sessionId = sessionStorage.getItem('analytics_session_id') || 
                    this.generateSessionId();
    
    sessionStorage.setItem('analytics_session_id', this.sessionId);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an analytics event
   */
  track(event: string, properties?: AnalyticsProperties, userId?: string): void {
    if (!this.isEnabled) {
      console.log(`[Analytics] Event tracked (disabled): ${event}`, properties);
      return;
    }

    try {
      const validatedEvent = analyticsEventSchema.parse({
        event,
        properties,
        userId,
      });

      const trackedEvent: TrackedEvent = {
        ...validatedEvent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId || undefined,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      };

      // Add to queue
      this.queue.push(trackedEvent);

      // Flush if queue is full
      if (this.queue.length >= this.batchSize) {
        this.flush();
      }

      console.log(`[Analytics] Event queued: ${event}`, trackedEvent);
    } catch (error) {
      console.error('[Analytics] Invalid event:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, properties?: AnalyticsProperties): void {
    this.track('page_view', {
      page,
      ...properties,
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, target: string, properties?: AnalyticsProperties): void {
    this.track('user_engagement', {
      action,
      target,
      ...properties,
    });
  }

  /**
   * Track conversion events
   */
  trackConversion(type: string, value?: number, properties?: AnalyticsProperties): void {
    this.track('conversion', {
      type,
      value: value || 0,
      ...properties,
    });
  }

  /**
   * Track error events
   */
  trackError(error: Error, context?: string, properties?: AnalyticsProperties): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      ...properties,
    });
  }

  /**
   * Flush queued events to storage
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const eventsToFlush = [...this.queue];
    this.queue = [];

    try {
      if (this.isEnabled) {
        await this.sendToSupabase(eventsToFlush);
      }
      
      console.log(`[Analytics] Flushed ${eventsToFlush.length} events`);
    } catch (error) {
      console.error('[Analytics] Flush failed:', error);
      
      // Re-queue failed events
      this.queue.unshift(...eventsToFlush);
    }
  }

  /**
   * Send events to Supabase
   */
  private async sendToSupabase(events: TrackedEvent[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(events.map(event => ({
          event_type: event.event,
          properties: event.properties || {},
          user_id: event.userId,
          session_id: event.sessionId,
          page_url: event.pageUrl,
          user_agent: event.userAgent,
          created_at: event.timestamp,
        })));

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[Analytics] Supabase insert failed:', error);
      throw error;
    }
  }

  /**
   * Start periodic flushing
   */
  private startPeriodicFlush(): void {
    if (typeof window === 'undefined') return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop periodic flushing
   */
  stopPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Get analytics summary for admin dashboard
   */
  async getSummary(days: number = 7): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    topEvents: Array<{ event: string; count: number }>;
    conversions: number;
  }> {
    if (!this.isEnabled) {
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        topEvents: [],
        conversions: 0,
      };
    }

    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      // Get total events
      const { count: totalEvents } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', cutoff.toISOString());

      // Get unique users
      const { count: uniqueUsers } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', cutoff.toISOString())
        .not('user_id', 'is', null);

      // Get top events
      const { data: topEvents } = await supabase
        .from('analytics_events')
        .select('event_type')
        .gte('created_at', cutoff.toISOString())
        .then(result => {
          if (!result.data) return [];
          
          const eventCounts: Record<string, number> = {};
          result.data.forEach(row => {
            eventCounts[row.event_type] = (eventCounts[row.event_type] || 0) + 1;
            return eventCounts;
          });
          
          return Object.entries(eventCounts)
            .map(([event, count]) => ({ event, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        });

      // Get conversions
      const { count: conversions } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', cutoff.toISOString())
        .eq('event_type', 'conversion');

      return {
        totalEvents: totalEvents || 0,
        uniqueUsers: uniqueUsers || 0,
        topEvents: topEvents || [],
        conversions: conversions || 0,
      };
    } catch (error) {
      console.error('[Analytics] Failed to get summary:', error);
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        topEvents: [],
        conversions: 0,
      };
    }
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldData(daysToKeep: number = 90): Promise<number> {
    if (!this.isEnabled) return 0;

    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysToKeep);

      const { error, count } = await supabase
        .from('analytics_events')
        .delete()
        .lt('created_at', cutoff.toISOString());

      if (error) {
        throw error;
      }

      console.log(`[Analytics] Cleaned up ${count} old events`);
      return count || 0;
    } catch (error) {
      console.error('[Analytics] Cleanup failed:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Convenience functions
export function track(event: string, properties?: AnalyticsProperties, userId?: string): void {
  analytics.track(event, properties, userId);
}

export function trackPageView(page: string, properties?: AnalyticsProperties): void {
  analytics.trackPageView(page, properties);
}

export function trackEngagement(action: string, target: string, properties?: AnalyticsProperties): void {
  analytics.trackEngagement(action, target, properties);
}

export function trackConversion(type: string, value?: number, properties?: AnalyticsProperties): void {
  analytics.trackConversion(type, value, properties);
}

export function trackError(error: Error, context?: string, properties?: AnalyticsProperties): void {
  analytics.trackError(error, context, properties);
}
