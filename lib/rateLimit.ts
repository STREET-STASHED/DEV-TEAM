// lib/rateLimit.ts
// ESM-friendly, no require(), underscore params to satisfy ESLint

export type RateLimitCounter = {
  current: number;
  resetTime: number; // epoch ms when the window resets
};

export interface RateLimitStore {
  get(_key: string): Promise<RateLimitCounter | null>;
  set(_key: string, _value: RateLimitCounter): Promise<void>;
  reset(_key: string): Promise<void>;
}

/**
 * In-memory store (per server instance). Good for dev and single-node.
 */
export class MemoryStore implements RateLimitStore {
  private store = new Map<string, RateLimitCounter>();

  async get(_key: string): Promise<RateLimitCounter | null> {
    const _now = Date.now();
    const _entry = this.store.get(_key) ?? null;
    if (_entry && _entry.resetTime <= _now) {
      this.store.delete(_key);
      return null;
    }
    return _entry;
  }

  async set(_key: string, _value: RateLimitCounter): Promise<void> {
    this.store.set(_key, _value);
  }

  async reset(_key: string): Promise<void> {
    this.store.delete(_key);
  }
}

/**
 * Optional: Upstash/Redis adapter (uncomment & install deps if you need it)
 *
 * import { Redis } from "@upstash/redis";
 * export class UpstashRedisStore implements RateLimitStore {
 *   constructor(private _redis: Redis, private _prefix = "rl:") {}
 *   private _k(_key: string) { return `${this._prefix}${_key}`; }
 *   async get(_key: string): Promise<RateLimitCounter | null> {
 *     const _raw = await this._redis.get<string>(this._k(_key));
 *     return _raw ? JSON.parse(_raw) as RateLimitCounter : null;
 *   }
 *   async set(_key: string, _value: RateLimitCounter): Promise<void> {
 *     const _ttl = Math.max(1, Math.ceil((_value.resetTime - Date.now()) / 1000));
 *     await this._redis.set(this._k(_key), JSON.stringify(_value), { ex: _ttl });
 *   }
 *   async reset(_key: string): Promise<void> {
 *     await this._redis.del(this._k(_key));
 *   }
 * }
 */

export type RateLimiterOptions = {
  windowMs: number; // e.g. 60_000
  max: number;      // e.g. 10
  store?: RateLimitStore;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  current: number;
};

/**
 * Create a rate limiter you can call with any key (e.g. userId, IP, route+IP).
 */
export function createRateLimiter(_opts: RateLimiterOptions) {
  const _store = _opts.store ?? new MemoryStore();
  const _windowMs = _opts.windowMs;
  const _max = _opts.max;

  return async function check(_key: string): Promise<RateLimitResult> {
    const _now = Date.now();
    const _bucket = (await _store.get(_key)) ?? {
      current: 0,
      resetTime: _now + _windowMs,
    };

    if (_bucket.resetTime <= _now) {
      _bucket.current = 0;
      _bucket.resetTime = _now + _windowMs;
    }

    _bucket.current += 1;
    await _store.set(_key, _bucket);

    const _allowed = _bucket.current <= _max;
    const _remaining = Math.max(0, _max - _bucket.current);

    return {
      allowed: _allowed,
      remaining: _remaining,
      resetTime: _bucket.resetTime,
      current: _bucket.current,
    };
  };
}

/**
 * Helper for Next.js (App Router) Route Handlers.
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *   export async function POST(req: Request) {
 *     const res = await enforceRateLimit(limiter, req, "orders:create");
 *     if (!res.allowed) return new Response("Too Many Requests", { status: 429 });
 *     // ...handler...
 *   }
 */
export async function enforceRateLimit(
  _check: (_key: string) => Promise<RateLimitResult>,
  _request: Request,
  _scope = "global"
): Promise<RateLimitResult> {
  // Prefer forwarded IP, then fallback to remote address-ish
  const _ip =
    _request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    _request.headers.get("x-real-ip") ||
    "unknown";

  const _key = `${_scope}:${_ip}`;
  return _check(_key);
}
