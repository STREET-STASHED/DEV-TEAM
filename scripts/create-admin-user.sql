-- Create Admin User Script
-- Run this in your Supabase SQL editor to create an admin user

-- Option 1: Update existing user to admin (if you already have a user account)
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);

-- Option 2: Create a new admin user (if you don't have an account yet)
-- First, create the user in auth.users (this will be done through your app signup)
-- Then run this to make them admin:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'USER_UUID_HERE';

-- Option 3: Direct database insert (emergency admin creation)
-- WARNING: Only use this if you can't access your app normally
-- INSERT INTO public.profiles (id, full_name, role, created_at)
-- VALUES (
--   gen_random_uuid(), -- Generate a new UUID
--   'Emergency Admin',
--   'admin',
--   NOW()
-- );

-- Verify the admin user was created
SELECT
  p.id,
  p.full_name,
  p.role,
  p.created_at,
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';
