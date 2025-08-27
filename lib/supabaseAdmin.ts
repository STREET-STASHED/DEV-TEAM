export const runtime = 'nodejs';

import type { Database } from '@/lib/supabase/database.types';
import { createClient } from '@supabase/supabase-js';

// Note: This file is for admin operations that require service role access
// The createClient from @supabase/supabase-js is used here because we need
// direct access to the service role key for admin operations

// Admin client for operations requiring elevated privileges
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin operations');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Alternative approach using the service role key directly
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin operations');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
}
