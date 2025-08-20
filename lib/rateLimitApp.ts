// 🚀 StreetStashed Rate Limiting for App Router
// Simple, lightweight rate limiting for Next.js 13+ App Router

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

// In-memory store for development
class MemoryRateLimitStore {
  private store = new Map<string, { current: number; resetTime: number }>();

  async check(key: string, maxRequests: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const resetTime = now + windowMs;

    // Get current rate limit info
    let current = this.store.get(key);

    if (!current) {
      // First request in this window
      current = { current: 1, resetTime };
      this.store.set(key, current);
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    if (now > current.resetTime) {
      // New window, reset counter
      current = { current: 1, resetTime };
      this.store.set(key, current);
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    if (current.current >= maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    // Increment request count
    current.current += 1;
    this.store.set(key, current);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - current.current,
      resetTime: current.resetTime,
    };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Global store instance
const store = new MemoryRateLimitStore();

// Main rate limiting function for App Router
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 100 }
): Promise<RateLimitResult> {
  const identifier = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'anonymous';
  
  return await store.check(identifier, config.maxRequests, config.windowMs);
}

// Predefined configurations
export const rateLimitConfigs = {
  strict: { windowMs: 15 * 60 * 1000, maxRequests: 5 },      // 5 requests per 15 minutes
  standard: { windowMs: 15 * 60 * 1000, maxRequests: 100 },  // 100 requests per 15 minutes
  loose: { windowMs: 15 * 60 * 1000, maxRequests: 1000 },   // 1000 requests per 15 minutes
  perMinute: { windowMs: 60 * 1000, maxRequests: 60 },      // 60 requests per minute
};

// Convenience function for standard rate limiting
export async function rateLimit(request: NextRequest): Promise<RateLimitResult> {
  return checkRateLimit(request, rateLimitConfigs.standard);
}
