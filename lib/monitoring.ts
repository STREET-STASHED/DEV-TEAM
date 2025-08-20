// 🚀 StreetStashed Production Monitoring & Analytics
// Centralized monitoring for errors, performance, and user behavior

// Augment the Window type for our monitoring hook
declare global {
  interface Window {
    __STREETSTASHED_MONITORING__?: {
      trackError: (_error: unknown, _component?: string) => void;
    };
  }
}

// Minimal type for Web Vitals metrics without importing types at runtime
interface WebVitalMetric {
  name: string;
  value: number;
  id?: string;
  delta?: number;
  rating?: "good" | "needs-improvement" | "poor" | string;
}

interface MonitoringConfig {
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableUserAnalytics: boolean;
  enableWebVitals: boolean;
  environment: "development" | "staging" | "production";
}

interface ErrorEvent {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

interface PerformanceEvent {
  name: string;
  value: number;
  category: "navigation" | "resource" | "paint" | "layout";
  timestamp: string;
  url: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

interface UserEvent {
  event: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  url: string;
  properties?: Record<string, unknown>;
}

class MonitoringService {
  private config: MonitoringConfig;
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorEvent[] = [];
  private performanceQueue: PerformanceEvent[] = [];
  private userEventQueue: UserEvent[] = [];
  private isInitialized = false;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize error tracking
      if (this.config.enableErrorTracking) {
        this.setupErrorTracking();
      }

      // Initialize performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring();
      }

      // Initialize user analytics
      if (this.config.enableUserAnalytics) {
        this.setupUserAnalytics();
      }

      // Initialize Web Vitals
      if (this.config.enableWebVitals) {
        this.setupWebVitals();
      }

      // Setup periodic flushing
      this.setupPeriodicFlushing();

      this.isInitialized = true;
      console.log("🚀 Monitoring service initialized");
    } catch (error) {
      console.error("Failed to initialize monitoring service:", error);
    }
  }

  private generateSessionId(): string {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  private setupErrorTracking() {
    // Global error handler
    window.addEventListener("error", (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        component: "global",
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      this.trackError({
        message: (event.reason as Error)?.message || "Unhandled promise rejection",
        stack: (event.reason as Error)?.stack,
        component: "promise",
        metadata: {
          reason: event.reason,
        },
      });
    });

    // React error boundary support
    if (typeof window !== "undefined") {
      window.__STREETSTASHED_MONITORING__ = {
        trackError: (error: unknown, component?: string) => {
          const err = error as { message?: unknown; stack?: unknown };
          this.trackError({
            message:
              typeof err?.message === "string" ? err.message : "React error",
            stack: typeof err?.stack === "string" ? err.stack : undefined,
            component,
            metadata: { error },
          });
        },
      };
    }
  }

  private setupPerformanceMonitoring() {
    if (typeof window === "undefined") return;

    // Navigation timing
    if ("performance" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformance({
            name: entry.name,
            value: entry.startTime,
            category: "navigation",
          });
        }
      });

      try {
        observer.observe({ entryTypes: ["navigation"] });
      } catch {
        console.warn("PerformanceObserver not supported");
      }
    }

    // Resource timing
    if ("performance" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "resource") {
            this.trackPerformance({
              name: (entry as PerformanceResourceTiming).name,
              value: (entry as PerformanceResourceTiming).duration,
              category: "resource",
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ["resource"] });
      } catch {
        console.warn("Resource timing not supported");
      }
    }
  }

  private setupUserAnalytics() {
    if (typeof window === "undefined") return;

    // Track page views
    let lastUrl = window.location.href;
    const trackPageView = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        this.trackUserEvent("page_view", {
          from: lastUrl,
          to: currentUrl,
        });
        lastUrl = currentUrl;
      }
    };

    // Track navigation
    if ("navigation" in window) {
      window.addEventListener("popstate", trackPageView);
    }

    // Track initial page view
    this.trackUserEvent("page_view", {
      from: "direct",
      to: window.location.href,
    });
  }

  private setupWebVitals() {
    if (typeof window === "undefined") return;

    // Core Web Vitals
    const trackWebVital = (metric: WebVitalMetric) => {
      this.trackPerformance({
        name: metric.name,
        value: metric.value,
        category: "paint",
        metadata: {
          id: metric.id,
          delta: metric.delta,
          rating: metric.rating,
        },
      });
    };

    // Import and use web-vitals if available
    try {
      void import("web-vitals").then((webVitals) => {
        // Use available functions dynamically
        if (webVitals.onCLS) webVitals.onCLS(trackWebVital);
        if (webVitals.onFCP) webVitals.onFCP(trackWebVital);
        if (webVitals.onINP) webVitals.onINP(trackWebVital);
        if (webVitals.onLCP) webVitals.onLCP(trackWebVital);
        if (webVitals.onTTFB) webVitals.onTTFB(trackWebVital);
      });
    } catch {
      console.log("web-vitals not available, skipping Web Vitals tracking");
    }
  }

  private setupPeriodicFlushing() {
    // Flush queues every 30 seconds
    setInterval(() => {
      void this.flushQueues();
    }, 30000);

    // Flush on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        void this.flushQueues();
      });
    }
  }

  // Public API methods
  setUserId(userId: string) {
    this.userId = userId;
  }

  trackError(
    error: Omit<ErrorEvent, "sessionId" | "timestamp" | "url" | "userAgent">,
  ) {
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      component: error.component,
      userId: error.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: error.metadata,
    };

    this.errorQueue.push(errorEvent);
    void this.flushQueues();
  }

  trackPerformance(performance: Omit<PerformanceEvent, "timestamp" | "url">) {
    const performanceEvent: PerformanceEvent = {
      name: performance.name,
      value: performance.value,
      category: performance.category,
      userId: performance.userId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    this.performanceQueue.push(performanceEvent);
    void this.flushQueues();
  }

  trackUserEvent(event: string, properties?: Record<string, unknown>) {
    const userEvent: UserEvent = {
      event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      properties,
    };

    this.userEventQueue.push(userEvent);
    void this.flushQueues();
  }

  private async flushQueues() {
    try {
      await Promise.all([
        void this.flushErrorQueue(),
        void this.flushPerformanceQueue(),
        void this.flushUserEventQueue(),
      ]);
    } catch (error) {
      console.error("Failed to flush monitoring queues:", error);
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await fetch("/api/monitoring/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errors, environment: this.config.environment }),
      });
    } catch (error) {
      console.error("Failed to send errors to monitoring endpoint:", error);
    }
  }

  private async flushPerformanceQueue() {
    if (this.performanceQueue.length === 0) return;

    const performance = [...this.performanceQueue];
    this.performanceQueue = [];

    try {
      await fetch("/api/monitoring/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performance,
          environment: this.config.environment,
        }),
      });
    } catch (error) {
      console.error(
        "Failed to send performance data to monitoring endpoint:",
        error,
      );
    }
  }

  private async flushUserEventQueue() {
    if (this.userEventQueue.length === 0) return;

    const events = [...this.userEventQueue];
    this.userEventQueue = [];

    try {
      await fetch("/api/monitoring/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events, environment: this.config.environment }),
      });
    } catch (error) {
      console.error(
        "Failed to send user events to monitoring endpoint:",
        error,
      );
    }
  }

  // Utility methods
  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  isEnabled(): boolean {
    return this.isInitialized;
  }
}

// Create and export monitoring instance
const monitoring = new MonitoringService({
  enableErrorTracking: process.env.NODE_ENV === "production",
  enablePerformanceMonitoring: process.env.NODE_ENV === "production",
  enableUserAnalytics: process.env.NODE_ENV === "production",
  enableWebVitals: process.env.NODE_ENV === "production",
  environment:
    (process.env.NODE_ENV as "development" | "staging" | "production") ||
    "development",
});

export default monitoring;

// Export types for external use
export type { ErrorEvent, PerformanceEvent, UserEvent, MonitoringConfig };

// Export utility functions
export const trackError = (error: unknown, component?: string) => {
  const err = error as { message?: unknown; stack?: unknown } | string | undefined;
  const message =
    typeof err === "string"
      ? err
      : typeof err?.message === "string"
      ? err.message
      : "Unknown error";
  const stack =
    typeof err !== "string" && typeof err?.stack === "string"
      ? err.stack
      : undefined;
  monitoring.trackError({ message, stack, component });
};

export const trackUserEvent = (
  event: string,
  properties?: Record<string, unknown>,
) => {
  monitoring.trackUserEvent(event, properties);
};

export const setUserId = (userId: string) => {
  monitoring.setUserId(userId);
};
