-- Cleanup Test Tables Migration
-- Removes test tables that were accidentally left in production schema
-- Drop test tables that shouldn't be in production
DROP TABLE IF EXISTS public.test_user_preferences;
DROP TABLE IF EXISTS public.test_inventory_analytics;
-- Clean up any related indexes or policies
-- (These would be automatically dropped with the tables)
-- Log the cleanup
SELECT 'Test tables cleanup completed successfully' as status;