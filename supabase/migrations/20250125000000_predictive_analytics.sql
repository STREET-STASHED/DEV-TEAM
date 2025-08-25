-- Predictive Analytics & Smart Inventory Migration (Test)
-- Creates basic tables for AI-powered inventory management

-- Test table creation with different name
CREATE TABLE IF NOT EXISTS public.test_inventory_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Test index creation
CREATE INDEX IF NOT EXISTS idx_test_inventory_analytics_item_id ON public.test_inventory_analytics(item_id);

-- Enable RLS
ALTER TABLE public.test_inventory_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy
CREATE POLICY "Users can view their own data" ON public.test_inventory_analytics FOR SELECT USING (auth.uid() = seller_id);