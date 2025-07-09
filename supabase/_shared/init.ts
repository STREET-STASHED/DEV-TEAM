// @deno-types="npm:@supabase/supabase-js@2"
import { createBrowserClient } from '@supabase/ssr';

export const initSupabase = (token: string) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  }

  return createBrowserClient(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` }
    }
  });
};