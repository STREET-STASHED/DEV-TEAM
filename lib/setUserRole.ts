

import supabase from './supabaseAdmin';

export async function setUserRole(userId: string, role: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ role, details_complete: false })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to set user role: ${error.message}`);
  }

  return data;
}