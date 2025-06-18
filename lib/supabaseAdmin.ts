

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Admin client uses the service role key for elevated privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  serviceRoleKey
);

export default supabaseAdmin;