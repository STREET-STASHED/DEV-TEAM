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

-- Update RLS policies to allow guest orders
-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "orders_buyer_select_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_buyer_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_buyer_select_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_buyer_insert" ON public.orders;

-- Create new policies that allow guest orders
CREATE POLICY "orders_buyer_select_insert" ON public.orders
FOR SELECT USING (
  (buyer_id = auth.uid()) OR
  (is_guest_order = TRUE AND guest_info->>'email' IS NOT NULL)
);

CREATE POLICY "orders_buyer_insert" ON public.orders
FOR INSERT WITH CHECK (
  (buyer_id = auth.uid()) OR
  (is_guest_order = TRUE AND guest_info->>'email' IS NOT NULL)
);

-- Allow admins to view all orders including guest orders
CREATE POLICY IF NOT EXISTS "admin_view_all_orders" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Add comment to document the new fields
COMMENT ON COLUMN public.orders.guest_info IS 'JSON object containing guest user information (email, full_name, phone) for unauthenticated orders';
COMMENT ON COLUMN public.orders.is_guest_order IS 'Boolean flag indicating if this order was placed by a guest user without authentication';
