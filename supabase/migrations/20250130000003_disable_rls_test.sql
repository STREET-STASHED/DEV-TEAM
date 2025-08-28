-- Test Migration: Temporarily Disable RLS for Guest Orders
-- This migration temporarily disables RLS to test if that's the issue

-- Temporarily disable RLS on orders table
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to anon and authenticated roles
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.orders TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comment
COMMENT ON TABLE public.orders IS 'Orders table with RLS temporarily disabled for testing guest orders';

-- Verify RLS is disabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'orders' AND rowsecurity = false
  ) THEN
    RAISE EXCEPTION 'RLS is still enabled on orders table';
  ELSE
    RAISE NOTICE 'RLS successfully disabled on orders table';
  END IF;
END $$;
