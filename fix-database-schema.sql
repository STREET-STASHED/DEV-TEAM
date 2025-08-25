-- 🚀 StreetStashed Database Schema Fix
-- Run this script in your Supabase SQL Editor to fix the schema issues
-- 1. First, let's check what tables exist and their current structure
SELECT table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'orders'
ORDER BY ordinal_position;
-- 2. Fix the orders table structure
-- Remove problematic foreign key constraints first
DO $$
DECLARE con RECORD;
BEGIN -- Drop any existing foreign keys on orders table
FOR con IN
SELECT conname
FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'orders'
    AND c.contype = 'f' LOOP EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT ' || quote_ident(con.conname);
END LOOP;
END $$;
-- 3. Add missing columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(8, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS distance_miles NUMERIC(8, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pickup_address TEXT,
    ADD COLUMN IF NOT EXISTS delivery_address TEXT,
    ADD COLUMN IF NOT EXISTS items JSONB,
    ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (
        payment_status IN (
            'pending',
            'processing',
            'completed',
            'failed',
            'refunded'
        )
    ),
    ADD COLUMN IF NOT EXISTS driver_pay DECIMAL(8, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS platform_margin DECIMAL(8, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- 4. Fix the buyer_id foreign key to reference profiles instead of users
-- First, ensure the column exists and is the right type
ALTER TABLE orders
ALTER COLUMN buyer_id TYPE UUID USING buyer_id::UUID;
-- Add the correct foreign key constraint
ALTER TABLE orders
ADD CONSTRAINT orders_buyer_fk FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE RESTRICT;
-- 5. Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
-- 7. Fix Row Level Security (RLS) policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS orders_buyer_select ON orders;
DROP POLICY IF EXISTS orders_buyer_insert ON orders;
DROP POLICY IF EXISTS orders_admin_bypass ON orders;
-- Create new RLS policies
CREATE POLICY orders_buyer_select ON orders FOR
SELECT USING (auth.uid() = buyer_id);
CREATE POLICY orders_buyer_insert ON orders FOR
INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY orders_admin_bypass ON orders FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.id = auth.uid()
            AND p.role = 'admin'
    )
);
-- 8. Grant proper permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
-- 9. Create a function to calculate delivery fees
CREATE OR REPLACE FUNCTION calculate_order_fees(
        order_distance DECIMAL,
        order_total DECIMAL
    ) RETURNS TABLE(
        delivery_fee DECIMAL,
        driver_pay DECIMAL,
        platform_margin DECIMAL
    ) AS $$ BEGIN -- Base delivery fee: $5 + $2 per mile
    delivery_fee := 5.00 + (order_distance * 2.00);
-- Driver gets 70% of delivery fee
driver_pay := delivery_fee * 0.70;
-- Platform margin: 30% of delivery fee
platform_margin := delivery_fee * 0.30;
RETURN QUERY
SELECT delivery_fee,
    driver_pay,
    platform_margin;
END;
$$ LANGUAGE plpgsql;
-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_order_fees TO authenticated;
-- 10. Update existing orders with default values
UPDATE orders
SET delivery_fee = COALESCE(delivery_fee, 0.00),
    distance_miles = COALESCE(distance_miles, 0),
    driver_pay = COALESCE(driver_pay, 0.00),
    platform_margin = COALESCE(platform_margin, 0.00),
    created_at = COALESCE(created_at, NOW()),
    updated_at = NOW()
WHERE delivery_fee IS NULL
    OR distance_miles IS NULL
    OR driver_pay IS NULL
    OR platform_margin IS NULL
    OR created_at IS NULL;
-- 11. Verify the fixes
SELECT 'Database schema fixed successfully!' as result;
-- 12. Show the final table structure
SELECT table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('orders', 'order_items')
ORDER BY table_name,
    ordinal_position;