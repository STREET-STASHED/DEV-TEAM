

import { supabase } from './supabaseClient';


export async function getVerifiedProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, verified')
    .eq('verified', true);

  if (error) {
    console.error('Error fetching verified profiles:', error);
    return [];
  }

  return data;
}