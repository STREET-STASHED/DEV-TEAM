/**
 * Safely parse JSON with fallback value
 * Prevents "Unexpected end of JSON input" errors
 */
export function safeJsonParse<T = unknown>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { 
    return JSON.parse(value) as T; 
  } catch { 
    return fallback; 
  }
}

/**
 * Safely parse JSON from environment variables
 */
export function safeEnvJsonParse<T = unknown>(envKey: string, fallback: T): T {
  const value = process.env[envKey];
  return safeJsonParse(value, fallback);
}

/**
 * Safely parse JSON from localStorage
 */
export function safeLocalStorageParse<T = unknown>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = localStorage.getItem(key);
    return safeJsonParse(value, fallback);
  } catch {
    return fallback;
  }
}
