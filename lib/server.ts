import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieMethodsServer } from '@supabase/ssr/dist/main/types'

/**
 * Initializes a Supabase client in a Server Component (App Router / Server Side)
 * leveraging the Next.js cookies API under the hood.
 */
export function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: cookies() as unknown as CookieMethodsServer
    }
  )
}

/**
 * Helper to retrieve the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
  return user
}