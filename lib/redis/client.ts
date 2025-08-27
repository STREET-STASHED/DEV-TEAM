import Redis from 'ioredis'

// Redis configuration with better fallback handling
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: process.env.NODE_ENV === 'development' ? 0 : 100,
  maxRetriesPerRequest: process.env.NODE_ENV === 'development' ? 0 : 1,
  lazyConnect: false, // Connect immediately
  showFriendlyErrorStack: process.env.NODE_ENV === 'development',
  connectTimeout: 5000,
  commandTimeout: 3000,
}

// Create Redis client with error handling
export const redis = new Redis(redisConfig)

// Redis client for pub/sub (separate connection)
export const redisPubSub = new Redis(redisConfig)

// Track Redis availability
let redisAvailable = false

// Handle Redis connection errors gracefully
redis.on('error', (error: any) => {
  redisAvailable = false
  if (error.code === 'ECONNREFUSED') {
    console.log('Redis not available, continuing without cache')
  } else {
    console.error('Redis error:', error)
  }
})

redis.on('connect', () => {
  redisAvailable = true
  console.log('Redis connected successfully')
})

redisPubSub.on('error', (error: any) => {
  if (error.code === 'ECONNREFUSED') {
    console.log('Redis pub/sub not available')
  } else {
    console.error('Redis pub/sub error:', error)
  }
})

// Cache configuration
export const CACHE_TTL = {
  RECOMMENDATIONS: 300, // 5 minutes
  USER_PROFILE: 600,    // 10 minutes
  INSIGHTS: 1800,       // 30 minutes
  TRENDING: 900,        // 15 minutes
  MOOD: 300,            // 5 minutes
}

// Cache key generators
export const cacheKeys = {
  recommendations: (userId: string) => `rec:${userId}`,
  userProfile: (userId: string) => `profile:${userId}`,
  insights: (userId: string) => `insights:${userId}`,
  trending: () => 'trending:items',
  mood: (userId: string) => `mood:${userId}`,
  context: (userId: string) => `context:${userId}`,
}

// Cache utilities with Redis availability check
export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    if (!redisAvailable) return null

    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set(key: string, value: Record<string, unknown>, ttl: number = CACHE_TTL.RECOMMENDATIONS): Promise<void> {
    if (!redisAvailable) return

    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  static async del(key: string): Promise<void> {
    if (!redisAvailable) return

    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    if (!redisAvailable) return

    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache pattern invalidation error:', error)
    }
  }

  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.RECOMMENDATIONS
  ): Promise<T> {
    if (!redisAvailable) {
      // If Redis is not available, just fetch fresh data
      return await fetchFn()
    }

    const cached = await this.get<T>(key)
    if (cached) return cached

    const fresh = await fetchFn()
    await this.set(key, fresh as any, ttl)
    return fresh
  }
}

// Real-time messaging utilities
export class RealTimeManager {
  static async publish(channel: string, message: Record<string, unknown>): Promise<void> {
    if (!redisAvailable) return

    try {
      await redisPubSub.publish(channel, JSON.stringify(message))
    } catch (error) {
      console.error('Redis publish error:', error)
    }
  }

  static async subscribe(channel: string, callback: (_message: Record<string, unknown>) => void): Promise<void> {
    if (!redisAvailable) return

    try {
      await redisPubSub.subscribe(channel)
      redisPubSub.on('message', (chan, _message) => {
        if (chan === channel) {
          callback(JSON.parse(_message))
        }
      })
    } catch (error) {
      console.error('Redis subscribe error:', error)
    }
  }
}

// Health check with better error handling
export async function checkRedisHealth(): Promise<boolean> {
  if (!redisAvailable) return false

  try {
    await redis.ping()
    return true
  } catch (error: any) {
    redisAvailable = false
    if (error.code === 'ECONNREFUSED') {
      console.log('Redis not available, continuing without cache')
      return false
    }
    console.error('Redis health check failed:', error)
    return false
  }
}

// Graceful shutdown
export async function closeRedisConnections(): Promise<void> {
  try {
    await redis.quit()
    await redisPubSub.quit()
  } catch (error) {
    console.error('Redis shutdown error:', error)
  }
}

export default redis
