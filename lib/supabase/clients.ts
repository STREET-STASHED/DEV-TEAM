export const runtime = 'nodejs';

export { createRouteHandlerClient } from '@/app/lib/supabase/server';

// ---- OPTIONAL: typed unwrap helper to standardize { data, error } ----
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

type Res<T> = PostgrestResponse<T> | PostgrestSingleResponse<T>;

export async function unwrap<T>(p: Promise<Res<T>>): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  // For .single() calls data is T, for list it's T[]; call sites should specify the exact T.
  return data as T;
}
