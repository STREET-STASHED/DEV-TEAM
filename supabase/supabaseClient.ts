

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export async function getUserRole(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users') // Replace 'users' with your actual table name if different
    .select('role')
    .eq('email', email)
    .single();

  if (error || !data) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data.role;
}