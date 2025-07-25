import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * Gets the user role from the profiles table
 * @param userId The user's UUID from auth.users
 * @returns The user's role or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
  if (!userId) {
    console.error('getUserRole: No user ID provided');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error.message);
    return null;
  }

  return data?.role || null;
}