-- Manual Fix for Database Permissions
-- Run this directly in your Supabase SQL Editor
-- 1. First, let's see what tables actually exist
SELECT table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- 2. Check current RLS status
SELECT schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- 3. Check current policies
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public';
-- 4. Temporarily disable RLS on all tables to test access
DO $$
DECLARE r RECORD;
BEGIN FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
) LOOP EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
RAISE NOTICE 'Disabled RLS on table: %',
r.tablename;
END LOOP;
END $$;
-- 5. Grant basic permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
-- 6. Test if we can now access tables
-- (This will show if the basic permissions are working)
-- 7. Re-enable RLS with proper policies
DO $$
DECLARE r RECORD;
BEGIN FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
) LOOP EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
RAISE NOTICE 'Re-enabled RLS on table: %',
r.tablename;
END LOOP;
END $$;
-- 8. Create basic RLS policies for reviews table (if it exists)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'reviews'
) THEN -- Drop existing policies if they exist
DROP POLICY IF EXISTS reviews_select_public ON reviews;
DROP POLICY IF EXISTS reviews_insert_self ON reviews;
DROP POLICY IF EXISTS reviews_update_self ON reviews;
DROP POLICY IF EXISTS reviews_delete_self ON reviews;
-- Create basic policies
CREATE POLICY reviews_select_public ON reviews FOR
SELECT USING (true);
CREATE POLICY reviews_insert_self ON reviews FOR
INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY reviews_update_self ON reviews FOR
UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY reviews_delete_self ON reviews FOR DELETE USING (auth.uid() = reviewer_id);
RAISE NOTICE 'Created RLS policies for reviews table';
END IF;
END $$;
-- 9. Create basic RLS policies for profiles table (if it exists)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'profiles'
) THEN -- Drop existing policies if they exist
DROP POLICY IF EXISTS profiles_select_public ON profiles;
DROP POLICY IF EXISTS profiles_insert_self ON profiles;
DROP POLICY IF EXISTS profiles_update_self ON profiles;
-- Create basic policies
CREATE POLICY profiles_select_public ON profiles FOR
SELECT USING (true);
CREATE POLICY profiles_insert_self ON profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_update_self ON profiles FOR
UPDATE USING (auth.uid() = user_id);
RAISE NOTICE 'Created RLS policies for profiles table';
END IF;
END $$;
-- 10. Create basic RLS policies for referrals table (if it exists)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'referrals'
) THEN -- Drop existing policies if they exist
DROP POLICY IF EXISTS referrals_select_public ON referrals;
DROP POLICY IF EXISTS referrals_insert_self ON referrals;
-- Create basic policies
CREATE POLICY referrals_select_public ON referrals FOR
SELECT USING (true);
CREATE POLICY referrals_insert_self ON referrals FOR
INSERT WITH CHECK (auth.uid() = referrer_id);
RAISE NOTICE 'Created RLS policies for referrals table';
END IF;
END $$;
-- 11. Verify the fixes
SELECT 'Permissions fixed successfully!' as result;
-- 12. Test access to key tables
SELECT 'Reviews table' as table_name,
    case
        when exists (
            select 1
            from information_schema.tables
            where table_name = 'reviews'
        ) then '✅ Exists'
        else '❌ Missing'
    end as status
UNION ALL
SELECT 'Profiles table' as table_name,
    case
        when exists (
            select 1
            from information_schema.tables
            where table_name = 'profiles'
        ) then '✅ Exists'
        else '❌ Missing'
    end as status
UNION ALL
SELECT 'Referrals table' as table_name,
    case
        when exists (
            select 1
            from information_schema.tables
            where table_name = 'referrals'
        ) then '✅ Exists'
        else '❌ Missing'
    end as status;