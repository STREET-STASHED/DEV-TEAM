import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Supabase admin client initialized with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey);

export const supabaseServer = supabaseAdmin;
