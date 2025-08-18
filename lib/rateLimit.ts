// 🚀 StreetStashed Rate Limiting Middleware
// Protects API endpoints from abuse with configurable limits

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextApiRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
  handler?: (req: NextApiRequest, res: NextApiResponse) => void; // Custom handler
  store?: RateLimitStore; // Custom store implementation
}

interface RateLimitStore {
  get(key: string): Promise<{ current: number; resetTime: number } | null>;
  set(
    key: string,
    value: { current: number; resetTime: number },
  ): Promise<void>;
  reset(key: string): Promise<void>;
}

interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

// In-memory store for development (not recommended for production)
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { current: number; resetTime: number }>();

  async get(
    key: string,
  ): Promise<{ current: number; resetTime: number } | null> {
    const value = this.store.get(key);
    if (!value) return null;

    // Check if window has expired
    if (Date.now() > value.resetTime) {
      this.store.delete(key);
      return null;
    }

    return value;
  }

  async set(
    key: string,
    value: { current: number; resetTime: number },
  ): Promise<void> {
    this.store.set(key, value);
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Supabase-based store for production
class SupabaseStore implements RateLimitStore {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async get(
    key: string,
  ): Promise<{ current: number; resetTime: number } | null> {
    try {
      const { data, error } = await this.supabase
        .from("rate_limits")
        .select("current, reset_time")
        .eq("key", key)
        .single();

      if (error || !data) return null;

      // Check if window has expired
      if (Date.now() > new Date(data.reset_time as string).getTime()) {
        await this.reset(key);
        return null;
      }

      return {
        current: data.current as number,
        resetTime: new Date(data.reset_time as string).getTime(),
      };
    } catch (error) {
      console.error("Rate limit store get error:", error);
      return null;
    }
  }

  async set(
    key: string,
    value: { current: number; resetTime: number },
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("rate_limits").upsert({
        key,
        current: value.current,
        reset_time: new Date(value.resetTime).toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Rate limit store set error:", error);
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.supabase.from("rate_limits").delete().eq("key", key);
    } catch (error) {
      console.error("Rate limit store reset error:", error);
    }
  }
}

// Redis store for high-performance production (optional)
class RedisStore implements RateLimitStore {
  private redis: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor() {
    // Initialize Redis client if available
    try {
      const Redis = require("ioredis");
      this.redis = new Redis(process.env.REDIS_URL);
    } catch {
      console.warn("Redis not available, falling back to Supabase store");
      this.redis = null;
    }
  }

  async get(
    key: string,
  ): Promise<{ current: number; resetTime: number } | null> {
    if (!this.redis) return null;

    try {
      const [current, resetTime] = await this.redis
        .multi()
        .get(`${key}:current`)
        .get(`${key}:resetTime`)
        .exec();

      if (!current[1] || !resetTime[1]) return null;

      const resetTimeNum = parseInt(resetTime[1]);
      if (Date.now() > resetTimeNum) {
        await this.reset(key);
        return null;
      }

      return {
        current: parseInt(current[1]),
        resetTime: resetTimeNum,
      };
    } catch (error) {
      console.error("Redis store get error:", error);
      return null;
    }
  }

  async set(
    key: string,
    value: { current: number; resetTime: number },
  ): Promise<void> {
    if (!this.redis) return;

    try {
      const windowMs = value.resetTime - Date.now();
      await this.redis
        .multi()
        .setex(`${key}:current`, Math.ceil(windowMs / 1000), value.current)
        .setex(`${key}:resetTime`, Math.ceil(windowMs / 1000), value.resetTime)
        .exec();
    } catch (error) {
      console.error("Redis store set error:", error);
    }
  }

  async reset(key: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis
        .multi()
        .del(`${key}:current`)
        .del(`${key}:resetTime`)
        .exec();
    } catch (error) {
      console.error("Redis store reset error:", error);
    }
  }
}

// Default key generator
const defaultKeyGenerator = (req: NextApiRequest): string => {
  // Use IP address as default key
  const ip = (req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    "unknown") as string;

  // Include user ID if authenticated
  const userId = (req as { user?: { id: string } }).user?.id;

  return userId ? `${ip}:${userId}` : ip;
};

// Default rate limit handler
const defaultHandler = (
  _req: NextApiRequest,
  res: NextApiResponse,
  info: RateLimitInfo,
): void => {
  res.setHeader("X-RateLimit-Limit", info.limit);
  res.setHeader("X-RateLimit-Remaining", info.remaining);
  res.setHeader("X-RateLimit-Reset", new Date(info.resetTime).toISOString());
  res.setHeader("Retry-After", Math.ceil(info.retryAfter / 1000));

  res.status(429).json({
    error: "Too Many Requests",
    message: `Rate limit exceeded. Try again in ${Math.ceil(info.retryAfter / 1000)} seconds.`,
    retryAfter: Math.ceil(info.retryAfter / 1000),
    limit: info.limit,
    remaining: info.remaining,
    resetTime: new Date(info.resetTime).toISOString(),
  });
};

// Main rate limiting function
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100, // 100 requests per window default
    keyGenerator = defaultKeyGenerator,
    handler = defaultHandler,
    store = new SupabaseStore(), // Use Supabase store by default
  } = config;

  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next?: () => void,
  ) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const resetTime = now + windowMs;

      // Get current rate limit info
      let current = await store.get(key);

      if (!current) {
        // First request in this window
        current = { current: 1, resetTime };
        await store.set(key, current);
      } else if (now < current.resetTime) {
        // Request within current window
        if (current.current >= maxRequests) {
          // Rate limit exceeded
          const info: RateLimitInfo = {
            limit: maxRequests,
            current: current.current,
            remaining: 0,
            resetTime: current.resetTime,
            retryAfter: current.resetTime - now,
          };

          handler(req, res, info);
          return;
        }

        // Increment request count
        current.current += 1;
        await store.set(key, current);
      } else {
        // New window, reset counter
        current = { current: 1, resetTime };
        await store.set(key, current);
      }

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, maxRequests - current.current),
      );
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(current.resetTime).toISOString(),
      );

      // Continue to next middleware/handler
      if (next) next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Continue without rate limiting on error
      if (next) next();
    }
  };
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict rate limiting for authentication endpoints
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
  },

  // Standard rate limiting for API endpoints
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },

  // Loose rate limiting for public endpoints
  loose: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
  },

  // Per-second rate limiting for high-frequency endpoints
  perSecond: {
    windowMs: 1000, // 1 second
    maxRequests: 10, // 10 requests per second
  },

  // Per-minute rate limiting for medium-frequency endpoints
  perMinute: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
};

// Utility function to create rate-limited API handler
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  config: RateLimitConfig = rateLimitConfigs.standard,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const rateLimitMiddleware = rateLimit(config);

    return new Promise<void>((resolve) => {
      void rateLimitMiddleware(req, res, () => {
        void handler(req, res);
        resolve();
      });
    });
  };
}

// Export store implementations
export { MemoryStore, SupabaseStore, RedisStore };
export type { RateLimitConfig, RateLimitStore, RateLimitInfo };
