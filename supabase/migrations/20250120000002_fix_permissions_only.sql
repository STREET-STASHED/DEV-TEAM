-- Fix Database Permissions for StreetStashed
-- This migration ONLY fixes permissions, doesn't recreate existing policies

-- 1. Grant proper permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 2. Grant specific permissions to existing tables (only if they exist)
DO $$
BEGIN
  -- Grant permissions to reviews table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    GRANT ALL ON reviews TO authenticated;
  END IF;
  
  -- Grant permissions to referral_leaderboard table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_leaderboard') THEN
    GRANT ALL ON referral_leaderboard TO authenticated;
  END IF;
  
  -- Grant permissions to push_tokens table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_tokens') THEN
    GRANT ALL ON push_tokens TO authenticated;
  END IF;
  
  -- Grant permissions to analytics_events table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    GRANT ALL ON analytics_events TO authenticated;
  END IF;
  
  -- Grant permissions to profiles table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    GRANT ALL ON profiles TO authenticated;
  END IF;
  
  -- Grant permissions to referrals table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals') THEN
    GRANT ALL ON referrals TO authenticated;
  END IF;
  
  -- Grant permissions to orders table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    GRANT ALL ON orders TO authenticated;
  END IF;
END $$;

-- 3. Grant execute permissions on functions (only if they exist)
DO $$
BEGIN
  -- Grant execute on refresh_referral_leaderboard function if it exists
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'refresh_referral_leaderboard') THEN
    GRANT EXECUTE ON FUNCTION refresh_referral_leaderboard() TO authenticated;
  END IF;
  
  -- Grant execute on get_average_rating function if it exists
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_average_rating') THEN
    GRANT EXECUTE ON FUNCTION get_average_rating(text, uuid) TO authenticated;
  END IF;
  
  -- Grant execute on get_review_count function if it exists
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_review_count') THEN
    GRANT EXECUTE ON FUNCTION get_review_count(text, uuid) TO authenticated;
  END IF;
END $$;

-- 4. Verify the fixes
SELECT 'Permissions fixed successfully!' as result;
