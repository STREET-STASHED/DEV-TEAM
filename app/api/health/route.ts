import { NextResponse } from 'next/server'
import { checkRedisHealth } from '@/lib/redis/client'
import { performanceMonitor } from '@/lib/analytics/performanceMonitor'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check Redis health
    const redisHealthy = await checkRedisHealth()
    
    // Check performance metrics
    const performanceHealthy = performanceMonitor.isHealthy()
    
    // Check overall system health
    const systemHealthy = redisHealthy && performanceHealthy
    
    const responseTime = Date.now() - startTime
    
    const healthStatus = {
      status: systemHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        redis: {
          status: redisHealthy ? 'healthy' : 'unhealthy',
          responseTime: responseTime
        },
        performance: {
          status: performanceHealthy ? 'healthy' : 'unhealthy',
          metrics: performanceMonitor.getPerformanceSummary()
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    }
    
    return NextResponse.json(healthStatus, {
      status: systemHealthy ? 200 : 503
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    }, {
      status: 503
    })
  }
}
