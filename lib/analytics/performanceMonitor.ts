import { CacheManager } from '../redis/client'

// Performance metrics interface
export interface PerformanceMetrics {
  timestamp: Date
  endpoint: string
  responseTime: number
  cacheHit: boolean
  userId?: string
  error?: string
  metadata: Record<string, unknown>
}

// Cache performance metrics
export interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  averageResponseTime: number
  totalRequests: number
}

// User engagement metrics
export interface EngagementMetrics {
  userId: string
  sessionDuration: number
  recommendationsViewed: number
  interactionsCount: number
  lastActive: Date
  personalizationScore: number
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private cacheMetrics: Map<string, CacheMetrics> = new Map()
  private engagementMetrics: Map<string, EngagementMetrics> = new Map()
  private startTime: Date = new Date()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Track API performance
  trackAPIPerformance(
    endpoint: string,
    responseTime: number,
    cacheHit: boolean,
    userId?: string,
    error?: string,
    metadata: Record<string, unknown> = {}
  ): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date(),
      endpoint,
      responseTime,
      cacheHit,
      userId,
      error,
      metadata
    }

    this.metrics.push(metric)
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${endpoint} - ${responseTime}ms - Cache: ${cacheHit ? 'HIT' : 'MISS'}`)
    }
  }

  // Track cache performance
  trackCachePerformance(
    cacheKey: string,
    hit: boolean,
    responseTime: number
  ): void {
    const existing = this.cacheMetrics.get(cacheKey) || {
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      totalRequests: 0
    }

    if (hit) {
      existing.hits++
    } else {
      existing.misses++
    }

    existing.totalRequests++
    existing.hitRate = existing.hits / existing.totalRequests
    existing.averageResponseTime = (
      (existing.averageResponseTime * (existing.totalRequests - 1) + responseTime) / 
      existing.totalRequests
    )

    this.cacheMetrics.set(cacheKey, existing)
  }

  // Track user engagement
  trackUserEngagement(
    userId: string,
    action: 'view' | 'like' | 'purchase' | 'session_start' | 'session_end',
    metadata: Record<string, unknown> = {}
  ): void {
    const existing = this.engagementMetrics.get(userId) || {
      userId,
      sessionDuration: 0,
      recommendationsViewed: 0,
      interactionsCount: 0,
      lastActive: new Date(),
      personalizationScore: 0.5
    }

    existing.lastActive = new Date()
    existing.interactionsCount++

    switch (action) {
      case 'view':
        existing.recommendationsViewed++
        break
      case 'session_start':
        existing.lastActive = new Date()
        break
      case 'session_end':
        // Calculate session duration if we have session start time
        if (metadata.sessionStart) {
          const startTime = new Date(metadata.sessionStart as string)
          existing.sessionDuration += new Date().getTime() - startTime.getTime()
        }
        break
    }

    this.engagementMetrics.set(userId, existing)
  }

  // Get performance summary
  getPerformanceSummary(): {
    totalRequests: number
    averageResponseTime: number
    cacheHitRate: number
    errorRate: number
    uptime: number
    topEndpoints: Array<{ endpoint: string; count: number; avgResponseTime: number }>
  } {
    const totalRequests = this.metrics.length
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
    const cacheHitRate = this.metrics.filter(m => m.cacheHit).length / totalRequests
    const errorRate = this.metrics.filter(m => m.error).length / totalRequests
    const uptime = new Date().getTime() - this.startTime.getTime()

    // Group by endpoint
    const endpointStats = new Map<string, { count: number; totalTime: number }>()
    this.metrics.forEach(m => {
      const existing = endpointStats.get(m.endpoint) || { count: 0, totalTime: 0 }
      existing.count++
      existing.totalTime += m.responseTime
      endpointStats.set(m.endpoint, existing)
    })

    const topEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgResponseTime: stats.totalTime / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalRequests,
      averageResponseTime,
      cacheHitRate,
      errorRate,
      uptime,
      topEndpoints
    }
  }

  // Get cache performance summary
  getCachePerformanceSummary(): {
    totalHits: number
    totalMisses: number
    overallHitRate: number
    averageResponseTime: number
    topCacheKeys: Array<{ key: string; hitRate: number; requests: number }>
  } {
    let totalHits = 0
    let totalMisses = 0
    let totalResponseTime = 0
    let totalRequests = 0

    this.cacheMetrics.forEach(metrics => {
      totalHits += metrics.hits
      totalMisses += metrics.misses
      totalResponseTime += metrics.averageResponseTime * metrics.totalRequests
      totalRequests += metrics.totalRequests
    })

    const overallHitRate = totalRequests > 0 ? totalHits / totalRequests : 0
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0

    const topCacheKeys = Array.from(this.cacheMetrics.entries())
      .map(([key, metrics]) => ({
        key,
        hitRate: metrics.hitRate,
        requests: metrics.totalRequests
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10)

    return {
      totalHits,
      totalMisses,
      overallHitRate,
      averageResponseTime,
      topCacheKeys
    }
  }

  // Get user engagement summary
  getUserEngagementSummary(): {
    totalUsers: number
    averageSessionDuration: number
    averageInteractions: number
    topUsers: Array<{ userId: string; interactions: number; personalizationScore: number }>
  } {
    const totalUsers = this.engagementMetrics.size
    const averageSessionDuration = Array.from(this.engagementMetrics.values())
      .reduce((sum, m) => sum + m.sessionDuration, 0) / totalUsers
    const averageInteractions = Array.from(this.engagementMetrics.values())
      .reduce((sum, m) => sum + m.interactionsCount, 0) / totalUsers

    const topUsers = Array.from(this.engagementMetrics.entries())
      .map(([userId, metrics]) => ({
        userId,
        interactions: metrics.interactionsCount,
        personalizationScore: metrics.personalizationScore
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10)

    return {
      totalUsers,
      averageSessionDuration,
      averageInteractions,
      topUsers
    }
  }

  // Export metrics for external monitoring
  exportMetrics(): {
    performance: ReturnType<typeof this.getPerformanceSummary>
    cache: ReturnType<typeof this.getCachePerformanceSummary>
    engagement: ReturnType<typeof this.getUserEngagementSummary>
    timestamp: Date
  } {
    return {
      performance: this.getPerformanceSummary(),
      cache: this.getCachePerformanceSummary(),
      engagement: this.getUserEngagementSummary(),
      timestamp: new Date()
    }
  }

  // Clear old metrics (keep last 24 hours)
  cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
  }

  // Health check
  isHealthy(): boolean {
    const summary = this.getPerformanceSummary()
    return summary.errorRate < 0.1 && summary.averageResponseTime < 1000
  }
}

// Performance decorator for methods
export function trackPerformance(_endpoint:string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      let cacheHit = false
      let error: string | undefined

      try {
        // Check if this is a cacheable operation
        if (args[0] && typeof args[0] === 'string') {
          const cacheKey = `${endpoint}:${args[0]}`
          const cached = await CacheManager.get(cacheKey)
          if (cached) {
            cacheHit = true
            const responseTime = Date.now() - startTime
            PerformanceMonitor.getInstance().trackAPIPerformance(
              endpoint,
              responseTime,
              cacheHit,
              args[0]
            )
            return cached
          }
        }

        const result = await method.apply(this, args)
        const responseTime = Date.now() - startTime

        PerformanceMonitor.getInstance().trackAPIPerformance(
          endpoint,
          responseTime,
          cacheHit,
          args[0]
        )

        return result
      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error'
        const responseTime = Date.now() - startTime

        PerformanceMonitor.getInstance().trackAPIPerformance(
          endpoint,
          responseTime,
          cacheHit,
          args[0],
          error
        )

        throw err
      }
    }

    return descriptor
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Auto-cleanup every hour
setInterval(() => {
  performanceMonitor.cleanupOldMetrics()
}, 60 * 60 * 1000)
