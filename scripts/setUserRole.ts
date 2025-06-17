#!/usr/bin/env npx ts-node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env
dotenv.config();
// DEBUG: ensure environment variables are loaded
console.log('SUPABASE_URL=', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY present=', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));

// Initialize Supabase Admin client with service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Update a user's role in Supabase user_metadata.
 * @param userId - The Supabase user ID (UUID).
 * @param role - The new role to assign.
 */
async function setUserRole(userId: string, role: string): Promise<void> {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role }
  });
  if (error) {
    console.error('Error updating user role:', error.message);
    process.exit(1);
  }
  console.log(`✅ Updated user ${userId} with role="${role}"`);
  process.exit(0);
}

// Parse command-line arguments
const [,, userId, role] = process.argv;
if (!userId || !role) {
  console.error('Usage: ts-node scripts/setUserRole.ts <USER_ID> <ROLE>');
  process.exit(1);
}

// Run the update
setUserRole(userId, role);
