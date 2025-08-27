import type { Database } from '@/lib/supabase/database.types'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Works in Node runtime (not Edge) and preserves auth via cookies
export async function createSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (_name: string) => cookieStore.get(_name)?.value,
        set: (_name: string, _value: string, _opts) => {
          // Next.js RSC cookies are immutable at render time; set in route handlers if needed
        },
        remove: (_name: string, _opts) => {}
      }
    }
  )
}

// For route handlers (server-side)
export const createRouteHandlerClient = createSupabaseServer;
