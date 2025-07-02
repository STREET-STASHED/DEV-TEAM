import { supabaseServer } from './supabaseServer';
const supabase = supabaseServer;

export async function getUserRoleById(id: string): Promise<{
  role: string | null;
  details_complete: boolean;
  verified: boolean;
  onboarded: boolean;
  has_completed_onboarding: boolean;
  verification_complete: boolean;
}> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, details_complete, verified, onboarded, has_completed_onboarding, verification_complete')
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
    onboarded: data?.onboarded ?? false,
    has_completed_onboarding: data?.has_completed_onboarding ?? false,
    verification_complete: data?.verification_complete ?? false,
  };
}

export { getUserRoleById as getUserRole };