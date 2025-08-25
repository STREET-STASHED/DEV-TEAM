// Performance Monitoring System for StreetStashed MVP
// Tracks query performance, database health, and optimization improvements

import { createClient } from '@supabase/supabase-js';
import queries from '../database/queries';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =============================
// PERFORMANCE METRICS
// =============================

export interface PerformanceMetric {
  queryName: string;
  executionTime: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  dataSize?: number;
}

export interface PerformanceReport {
  totalQueries: number;
  averageExecutionTime: number;
  successRate: number;
  slowestQueries: PerformanceMetric[];
  fastestQueries: PerformanceMetric[];
  errors: PerformanceMetric[];
  recommendations: string[];
}

// =============================
// PERFORMANCE TRACKING
// =============================

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Track a query execution
   */
  trackQuery(
    queryName: string,
    executionTime: number,
    success: boolean,
    error?: string,
    dataSize?: number
  ) {
    const metric: PerformanceMetric = {
      queryName,
      executionTime,
      timestamp: new Date(),
      success,
      error,
      dataSize
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${queryName}: ${executionTime}ms ${success ? '✅' : '❌'}`);
    }
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const successfulQueries = this.metrics.filter(m => m.success);
    const failedQueries = this.metrics.filter(m => !m.success);

    const averageExecutionTime = successfulQueries.length > 0
      ? successfulQueries.reduce((sum, m) => sum + m.executionTime, 0) / successfulQueries.length
      : 0;

    const successRate = this.metrics.length > 0
      ? (successfulQueries.length / this.metrics.length) * 100
      : 0;

    const slowestQueries = [...successfulQueries]
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 5);

    const fastestQueries = [...successfulQueries]
      .sort((a, b) => a.executionTime - b.executionTime)
      .slice(0, 5);

    const recommendations = this.generateRecommendations();

    return {
      totalQueries: this.metrics.length,
      averageExecutionTime,
      successRate,
      slowestQueries,
      fastestQueries,
      errors: failedQueries,
      recommendations
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.getReport();

    if (report.averageExecutionTime > 1000) {
      recommendations.push('Average query time is high (>1s). Consider adding more indexes or optimizing slow queries.');
    }

    if (report.successRate < 95) {
      recommendations.push('Query success rate is below 95%. Check for database connection issues or query errors.');
    }

    const slowQueries = report.slowestQueries.filter(q => q.executionTime > 5000);
    if (slowQueries.length > 0) {
      recommendations.push(`Found ${slowQueries.length} queries taking >5s. These need immediate optimization.`);
    }

    return recommendations;
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics = [];
  }
}

// Global performance tracker instance
export const performanceTracker = new PerformanceTracker();

// =============================
// PERFORMANCE WRAPPERS
// =============================

/**
 * Wrap a query function with performance tracking
 */
export function withPerformanceTracking<T extends any[], R>(
  queryName: string,
  queryFn: (..._args: T) => Promise<R>
) {
  return async (..._args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await queryFn(..._args);
      const executionTime = Date.now() - startTime;
      
      performanceTracker.trackQuery(
        queryName,
        executionTime,
        true,
        undefined,
        Array.isArray(result) ? result.length : undefined
      );
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      performanceTracker.trackQuery(
        queryName,
        executionTime,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      throw error;
    }
  };
}

// =============================
// PERFORMANCE MONITORING FUNCTIONS
// =============================

export const performanceMonitoring = {
  /**
   * Monitor database health
   */
  async checkDatabaseHealth() {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      const { data: _testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) throw testError;
      
      // Check maintenance status
      const maintenanceStatus = await queries.maintenance.getStatus();
      
      // Check partition statistics
      const partitionStats = await queries.maintenance.getPartitionStats();
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        executionTime,
        health: {
          connectivity: 'healthy',
          maintenance: maintenanceStatus,
          partitions: partitionStats,
          timestamp: new Date()
        }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        health: {
          connectivity: 'unhealthy',
          timestamp: new Date()
        }
      };
    }
  },

  /**
   * Run performance benchmarks
   */
  async runBenchmarks() {
    const benchmarks = [
      { name: 'Marketplace Overview', fn: () => queries.marketplace.getOverview() },
      { name: 'Active Orders', fn: () => queries.order.getActiveOrders() },
      { name: 'Top Products', fn: () => queries.marketplace.getTopProducts(10) },
      { name: 'Available Stashers', fn: () => queries.stasher.getAvailable() },
      { name: 'Dashboard Data', fn: () => queries.dashboard.getData() }
    ];

    const results = [];

    for (const benchmark of benchmarks) {
      const startTime = Date.now();
      
      try {
        const result = await benchmark.fn();
        const executionTime = Date.now() - startTime;
        
        results.push({
          name: benchmark.name,
          executionTime,
          success: true,
          dataSize: Array.isArray(result) ? result.length : 1
        });
        
        performanceTracker.trackQuery(
          `benchmark_${benchmark.name}`,
          executionTime,
          true,
          undefined,
          Array.isArray(result) ? result.length : 1
        );
      } catch (error) {
        const executionTime = Date.now() - startTime;
        
        results.push({
          name: benchmark.name,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        performanceTracker.trackQuery(
          `benchmark_${benchmark.name}`,
          executionTime,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    return results;
  },

  /**
   * Get comprehensive performance report
   */
  async getPerformanceReport() {
    const [health, benchmarks, report] = await Promise.all([
      this.checkDatabaseHealth(),
      this.runBenchmarks(),
      Promise.resolve(performanceTracker.getReport())
    ]);

    return {
      timestamp: new Date(),
      health,
      benchmarks,
      metrics: report,
      summary: {
        overallHealth: health.success ? 'healthy' : 'unhealthy',
        averageQueryTime: report.averageExecutionTime,
        successRate: report.successRate,
        totalQueries: report.totalQueries
      }
    };
  },

  /**
   * Monitor specific query performance
   */
  async monitorQuery(queryName: string, queryFn: () => Promise<any>) {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const executionTime = Date.now() - startTime;
      
      performanceTracker.trackQuery(
        queryName,
        executionTime,
        true,
        undefined,
        Array.isArray(result) ? result.length : undefined
      );
      
      return {
        success: true,
        executionTime,
        data: result,
        dataSize: Array.isArray(result) ? result.length : undefined
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      performanceTracker.trackQuery(
        queryName,
        executionTime,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      return {
        success: false,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// =============================
// AUTOMATED MONITORING
// =============================

/**
 * Set up automated performance monitoring
 */
export function setupPerformanceMonitoring() {
  // Monitor performance every 5 minutes in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(async () => {
      try {
        const report = await performanceMonitoring.getPerformanceReport();
        console.log('[Performance Report]', report.summary);
        
        if (report.metrics.recommendations.length > 0) {
          console.log('[Recommendations]', report.metrics.recommendations);
        }
      } catch (error) {
        console.error('[Performance Monitoring Error]', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// =============================
// ALERTING SYSTEM
// =============================

export const performanceAlerts = {
  /**
   * Check for performance issues and send alerts
   */
  async checkForIssues() {
    const report = await performanceMonitoring.getPerformanceReport();
    const alerts = [];

    // Check for slow queries
    const slowQueries = report.metrics.slowestQueries.filter(q => q.executionTime > 2000);
    if (slowQueries.length > 0) {
      alerts.push({
        type: 'slow_queries',
        severity: 'warning',
        message: `${slowQueries.length} queries are taking >2s to execute`,
        details: slowQueries
      });
    }

    // Check for high error rate
    if (report.metrics.successRate < 90) {
      alerts.push({
        type: 'high_error_rate',
        severity: 'critical',
        message: `Query success rate is ${report.metrics.successRate.toFixed(1)}% (below 90%)`,
        details: report.metrics.errors
      });
    }

    // Check database health
    if (!report.health.success) {
      alerts.push({
        type: 'database_unhealthy',
        severity: 'critical',
        message: 'Database health check failed',
        details: report.health
      });
    }

    return alerts;
  },

  /**
   * Send alert notification
   */
  async sendAlert(alert: any) {
    // In a real application, you would send this to your alerting system
    // (Slack, email, PagerDuty, etc.)
    console.error('[Performance Alert]', alert);
    
    // Example: Send to external monitoring service
    // await fetch('/api/alerts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(alert)
    // });
  }
};

// Initialize performance monitoring
setupPerformanceMonitoring();
