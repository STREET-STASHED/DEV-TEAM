-- Fix Database Permissions for StreetStashed
-- Run this in your Supabase SQL Editor to resolve RLS issues
-- 1. Grant proper permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
-- 2. Fix RLS policies for reviews table
DROP POLICY IF EXISTS reviews_insert_self ON reviews;
DROP POLICY IF EXISTS reviews_update_self ON reviews;
DROP POLICY IF EXISTS reviews_delete_self ON reviews;
DROP POLICY IF EXISTS reviews_select_public ON reviews;
-- Create more permissive policies
CREATE POLICY reviews_insert_self ON reviews FOR
INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY reviews_update_self ON reviews FOR
UPDATE TO authenticated USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY reviews_delete_self ON reviews FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);
CREATE POLICY reviews_select_public ON reviews FOR
SELECT USING (true);
-- 3. Fix RLS policies for profiles table (if it exists)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'profiles'
) THEN -- Grant access to profiles table
GRANT ALL ON profiles TO authenticated;
-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Create policies for profiles
DROP POLICY IF EXISTS profiles_select_public ON profiles;
DROP POLICY IF EXISTS profiles_insert_self ON profiles;
DROP POLICY IF EXISTS profiles_update_self ON profiles;
CREATE POLICY profiles_select_public ON profiles FOR
SELECT USING (true);
CREATE POLICY profiles_insert_self ON profiles FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_update_self ON profiles FOR
UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END IF;
END $$;
-- 4. Fix RLS policies for referrals table (if it exists)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'referrals'
) THEN -- Grant access to referrals table
GRANT ALL ON referrals TO authenticated;
-- Enable RLS if not already enabled
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
-- Create policies for referrals
DROP POLICY IF EXISTS referrals_select_public ON referrals;
DROP POLICY IF EXISTS referrals_insert_self ON referrals;
CREATE POLICY referrals_select_public ON referrals FOR
SELECT USING (true);
CREATE POLICY referrals_insert_self ON referrals FOR
INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);
END IF;
END $$;
-- 5. Fix RLS policies for orders table (if it exists)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'orders'
) THEN -- Grant access to orders table
GRANT ALL ON orders TO authenticated;
-- Enable RLS if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Create policies for orders
DROP POLICY IF EXISTS orders_select_self ON orders;
DROP POLICY IF EXISTS orders_insert_self ON orders;
CREATE POLICY orders_select_self ON orders FOR
SELECT TO authenticated USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
    );
CREATE POLICY orders_insert_self ON orders FOR
INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
END IF;
END $$;
-- 6. Fix RLS policies for push_tokens table
DROP POLICY IF EXISTS push_tokens_insert_self ON push_tokens;
DROP POLICY IF EXISTS push_tokens_select_self ON push_tokens;
DROP POLICY IF EXISTS push_tokens_update_self ON push_tokens;
DROP POLICY IF EXISTS push_tokens_delete_self ON push_tokens;
CREATE POLICY push_tokens_insert_self ON push_tokens FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY push_tokens_select_self ON push_tokens FOR
SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY push_tokens_update_self ON push_tokens FOR
UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY push_tokens_delete_self ON push_tokens FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- 7. Fix RLS policies for analytics_events table
DROP POLICY IF EXISTS analytics_events_insert_authenticated ON analytics_events;
DROP POLICY IF EXISTS analytics_events_select_public ON analytics_events;
CREATE POLICY analytics_events_insert_authenticated ON analytics_events FOR
INSERT TO authenticated WITH CHECK (true);
CREATE POLICY analytics_events_select_public ON analytics_events FOR
SELECT USING (true);
-- 8. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION refresh_referral_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_average_rating(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_review_count(text, uuid) TO authenticated;
-- 9. Verify the fixes
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
    end as status
UNION ALL
SELECT 'Orders table' as table_name,
    case
        when exists (
            select 1
            from information_schema.tables
            where table_name = 'orders'
        ) then '✅ Exists'
        else '❌ Missing'
    end as status;
-- 10. Test basic permissions
SELECT 'Permissions fixed successfully!' as result;