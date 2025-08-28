-- Fix Guest Order RLS Policies Migration
-- This migration corrects the RLS policies to properly allow guest order creation

-- Drop existing policies that are blocking guest orders
DROP POLICY IF EXISTS "orders_buyer_select_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_buyer_insert" ON public.orders;
DROP POLICY IF EXISTS "guest_orders_readable_by_email" ON public.orders;
DROP POLICY IF EXISTS "authenticated_users_can_manage_own_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_view_all_orders" ON public.orders;

-- Temporarily disable RLS to allow policy updates
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own orders
CREATE POLICY "authenticated_users_manage_own_orders" ON public.orders
FOR ALL USING (
  buyer_id = auth.uid() AND is_guest_order = FALSE
);

-- Create policy for guest order creation (INSERT) - This is the key policy
CREATE POLICY "allow_guest_order_creation" ON public.orders
FOR INSERT WITH CHECK (
  is_guest_order = TRUE AND
  guest_info->>'email' IS NOT NULL
);

-- Create policy for guest order reading (SELECT)
CREATE POLICY "allow_guest_order_reading" ON public.orders
FOR SELECT USING (
  (is_guest_order = TRUE AND guest_info->>'email' IS NOT NULL) OR
  (buyer_id = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
);

-- Create policy for admin access
CREATE POLICY "admin_full_access" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Grant necessary permissions to anon and authenticated roles
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.orders TO authenticated;

-- Ensure the table is accessible
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comment to document the policies
COMMENT ON TABLE public.orders IS 'Orders table with RLS policies for authenticated users and guest orders';

-- Verify the policies were created
DO $$
BEGIN
  RAISE NOTICE 'Migration completed. Policies created:';
  RAISE NOTICE '- authenticated_users_manage_own_orders';
  RAISE NOTICE '- allow_guest_order_creation';
  RAISE NOTICE '- allow_guest_order_reading';
  RAISE NOTICE '- admin_full_access';
END $$;
