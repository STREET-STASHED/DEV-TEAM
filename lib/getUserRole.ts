import supabase from './supabaseClient';

export async function getUserRoleById(id: string): Promise<{
  role: string | null;
  details_complete: boolean;
  verified: boolean;
}> {
  const { data, error } = await supabase
    .from('users')
    .select('role, details_complete, verified')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
  if (!data) {
    console.warn(`No user found with id: ${id}`);
  }
  if (data?.role) {
  }
  return {
    role: data?.role ?? null,
    details_complete: data?.details_complete ?? false,
    verified: data?.verified ?? false,
  };
}

export { getUserRoleById as getUserRole };