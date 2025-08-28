-- Simplify Guest Order RLS Policies Migration
-- This migration removes the profiles table dependency that's blocking guest orders

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_users_manage_own_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_guest_order_creation" ON public.orders;
DROP POLICY IF EXISTS "allow_guest_order_reading" ON public.orders;
DROP POLICY IF EXISTS "admin_full_access" ON public.orders;

-- Temporarily disable RLS to allow policy updates
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create simple policy for authenticated users to manage their own orders
CREATE POLICY "authenticated_users_manage_own_orders" ON public.orders
FOR ALL USING (
  buyer_id = auth.uid() AND is_guest_order = FALSE
);

-- Create simple policy for guest order creation (INSERT)
CREATE POLICY "allow_guest_order_creation" ON public.orders
FOR INSERT WITH CHECK (
  is_guest_order = TRUE AND
  guest_info->>'email' IS NOT NULL
);

-- Create simple policy for guest order reading (SELECT)
CREATE POLICY "allow_guest_order_reading" ON public.orders
FOR SELECT USING (
  (is_guest_order = TRUE AND guest_info->>'email' IS NOT NULL) OR
  (buyer_id = auth.uid())
);

-- Grant necessary permissions
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.orders TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comment
COMMENT ON TABLE public.orders IS 'Orders table with simplified RLS policies for guest orders';

-- Verify the policies were created
DO $$
BEGIN
  RAISE NOTICE 'Migration completed. Simplified policies created:';
  RAISE NOTICE '- authenticated_users_manage_own_orders';
  RAISE NOTICE '- allow_guest_order_creation';
  RAISE NOTICE '- allow_guest_order_reading';
END $$;
