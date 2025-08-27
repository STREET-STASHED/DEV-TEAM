// src/lib/supabase/typed.ts
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

// Covers both list and single() responses
type R<T> = PostgrestResponse<T> | PostgrestSingleResponse<T>;

/**
 * Keep the familiar `{ data, error }` destructure,
 * while giving TS the correct generic `T`.
 */
export async function query<T>(p: Promise<R<T>>) {
  return (await p) as R<T>;
}
