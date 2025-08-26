import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

// Performance monitoring configuration
export const performanceConfig = {
  // Core Web Vitals thresholds
  thresholds: {
    CLS: 0.1, // Cumulative Layout Shift
    FID: 100, // First Input Delay (ms)
    FCP: 1800, // First Contentful Paint (ms)
    LCP: 2500, // Largest Contentful Paint (ms)
    TTFB: 800, // Time to First Byte (ms)
  },

  // Performance monitoring options
  options: {
    sampleRate: 1.0, // 100% of users
    debug: process.env.NODE_ENV === 'development',
  },
};

// Performance metric types
export interface PerformanceMetrics {
  CLS?: number;
  FID?: number;
  FCP?: number;
  LCP?: number;
  TTFB?: number;
}

// Performance monitoring callback
export function reportWebVitals(metric: any) {
  const { name, value, id } = metric;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital: ${name}`, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric,
    });
  }

  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  sendToAnalytics(metric);
}

// Send performance data to analytics
async function sendToAnalytics(metric: any) {
  try {
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    // Silently fail in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to send performance data:', error);
    }
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor Core Web Vitals
  getCLS(reportWebVitals);
  getFID(reportWebVitals);
  getFCP(reportWebVitals);
  getLCP(reportWebVitals);
  getTTFB(reportWebVitals);

  // Monitor custom performance metrics
  monitorCustomMetrics();
}

// Monitor custom performance metrics
function monitorCustomMetrics() {
  if (typeof window === 'undefined') return;

  // Monitor bundle size
  if ('performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.name.includes('.js') || resourceEntry.name.includes('.css')) {
            reportBundleSize(resourceEntry);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
        console.warn('High memory usage detected:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        });
      }
    }, 30000); // Check every 30 seconds
  }
}

// Report bundle size metrics
function reportBundleSize(entry: PerformanceResourceTiming) {
  const size = entry.transferSize || entry.encodedBodySize || 0;
  const duration = entry.duration;

  if (size > 100 * 1024) { // 100KB threshold
    console.warn('Large bundle detected:', {
      url: entry.name,
      size: Math.round(size / 1024) + 'KB',
      duration: Math.round(duration) + 'ms',
    });
  }
}

// Performance utility functions
export const performanceUtils = {
  // Measure function execution time
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} took ${Math.round(end - start)}ms`);
    }

    return result;
  },

  // Measure async function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} took ${Math.round(end - start)}ms`);
    }

    return result;
  },

  // Debounce function
  debounce<T extends (..._args: any[]) => any>(
    func: T,
    wait: number
  ): (..._args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (..._args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(..._args), wait);
    };
  },

  // Throttle function
  throttle<T extends (..._args: any[]) => any>(
    func: T,
    limit: number
  ): (..._args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (..._args: Parameters<T>) => {
      if (!inThrottle) {
        func(..._args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Export default
export default {
  initPerformanceMonitoring,
  reportWebVitals,
  performanceUtils,
  performanceConfig,
};
