-- Add Admin Role Support Migration
-- This migration adds 'admin' role to the profiles table and creates admin policies

-- 1. Update the profiles table to allow 'admin' role
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_chk;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_chk CHECK (
  role IN ('buyer', 'seller', 'stylist', 'driver', 'admin')
);

-- 2. Create admin bypass policy for all tables
CREATE POLICY IF NOT EXISTS "admin_bypass_all" ON public.profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Create admin bypass for items table
CREATE POLICY IF NOT EXISTS "admin_bypass_items" ON public.items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Create admin bypass for orders table
CREATE POLICY IF NOT EXISTS "admin_bypass_orders" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Create admin bypass for user_behaviors table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_behaviors') THEN
    EXECUTE 'CREATE POLICY IF NOT EXISTS "admin_bypass_user_behaviors" ON public.user_behaviors FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = ''admin''
      )
    )';
  END IF;
END $$;

-- 6. Create admin bypass for analytics_events table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    EXECUTE 'CREATE POLICY IF NOT EXISTS "admin_bypass_analytics_events" ON public.analytics_events FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = ''admin''
      )
    )';
  END IF;
END $$;

-- 7. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;

-- 8. Create function to promote user to admin (for super admins only)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can promote users to admin role';
  END IF;

  -- Update the target user's role to admin
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (they'll be checked inside the function)
GRANT EXECUTE ON FUNCTION public.promote_to_admin TO authenticated;
