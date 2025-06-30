

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/supabase-js';

const supabase = createPagesBrowserClient();

export default supabase;
export type { SupabaseClient };