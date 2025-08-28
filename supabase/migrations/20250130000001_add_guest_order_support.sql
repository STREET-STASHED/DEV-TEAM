-- Add Guest Order Support Migration
-- This migration adds fields to support guest orders without authentication

-- Make buyer_id nullable to support guest orders
ALTER TABLE public.orders
ALTER COLUMN buyer_id DROP NOT NULL;

-- Add guest order support fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS guest_info JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_guest_order BOOLEAN DEFAULT FALSE;

-- Ensure all required fields exist for guest orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS pickup_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS delivery_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS distance_miles NUMERIC(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS item_total NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS support_fee_total NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS driver_payout NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_margin NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0;

-- Add index for guest orders
CREATE INDEX IF NOT EXISTS idx_orders_guest_orders ON public.orders(is_guest_order) WHERE is_guest_order = TRUE;

-- Temporarily disable RLS to allow guest order creation
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Create a function to handle guest order creation
CREATE OR REPLACE FUNCTION public.create_guest_order(
  p_items JSONB,
  p_total_amount NUMERIC,
  p_pickup_address JSONB,
  p_delivery_address JSONB,
  p_distance_miles NUMERIC,
  p_guest_info JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
BEGIN
  INSERT INTO public.orders (
    buyer_id,
    seller_id,
    status,
    items,
    pickup_address,
    delivery_address,
    distance_miles,
    item_total,
    total_amount,
    support_fee_total,
    driver_payout,
    platform_margin,
    guest_info,
    is_guest_order,
    created_at,
    updated_at
  ) VALUES (
    NULL, -- buyer_id is NULL for guest orders
    '00000000-0000-0000-0000-000000000000', -- Default seller ID
    'pending',
    p_items,
    p_pickup_address,
    p_delivery_address,
    p_distance_miles,
    p_total_amount,
    p_total_amount,
    0, -- support_fee_total
    0, -- driver_payout
    0, -- platform_margin
    p_guest_info,
    TRUE, -- is_guest_order
    NOW(),
    NOW()
  ) RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.create_guest_order TO anon;
GRANT EXECUTE ON FUNCTION public.create_guest_order TO authenticated;

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "authenticated_users_can_manage_own_orders" ON public.orders
FOR ALL USING (buyer_id = auth.uid());

-- Create policies for guest orders (read-only access)
CREATE POLICY "guest_orders_readable_by_email" ON public.orders
FOR SELECT USING (
  is_guest_order = TRUE AND
  guest_info->>'email' IS NOT NULL
);

-- Allow admins to view all orders
CREATE POLICY "admin_view_all_orders" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Add comment to document the new fields
COMMENT ON COLUMN public.orders.guest_info IS 'JSON object containing guest user information (email, full_name, phone) for unauthenticated orders';
COMMENT ON COLUMN public.orders.is_guest_order IS 'Boolean flag indicating if this order was placed by a guest user without authentication';
