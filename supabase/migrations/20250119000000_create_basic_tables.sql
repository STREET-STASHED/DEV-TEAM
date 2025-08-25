-- 🚀 StreetStashed Basic Tables Migration
-- Create basic tables that are referenced by other migrations
-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    category TEXT,
    tags TEXT [],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
-- RLS policies for products
CREATE POLICY "Products are viewable by everyone" ON public.products FOR
SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage their own products" ON public.products FOR ALL USING (seller_id = auth.uid());
-- RLS policies for order_items
CREATE POLICY "Users can view their own order items" ON public.order_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.orders o
            WHERE o.id = order_items.order_id
                AND (
                    o.buyer_id = auth.uid()
                    OR o.seller_id = auth.uid()
                )
        )
    );
-- Create updated_at trigger for products
CREATE TRIGGER update_products_updated_at BEFORE
UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();