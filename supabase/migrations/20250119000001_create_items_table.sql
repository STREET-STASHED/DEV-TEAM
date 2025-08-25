-- Create Items Table Migration
-- Creates the items table for marketplace listings that references products

-- ITEMS (for marketplace listings)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  category TEXT,
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Helpful indexes for items
CREATE INDEX IF NOT EXISTS items_seller_id_idx ON public.items (seller_id);
CREATE INDEX IF NOT EXISTS items_category_idx ON public.items (category);
CREATE INDEX IF NOT EXISTS items_active_idx ON public.items (active);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON public.items (created_at);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read access to active items
CREATE POLICY "Public can view active items" ON public.items FOR
SELECT USING (active = true);

-- Sellers can manage their own items
CREATE POLICY "Sellers can manage their own items" ON public.items FOR ALL USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

-- Admins can manage all items
CREATE POLICY "Admins can manage all items" ON public.items FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);
