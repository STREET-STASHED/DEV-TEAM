import supabase from './supabaseClient';

export default async function getUserRole(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users') // adjust this table name if your user roles are in a different table
    .select('role')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role || null;
}