-- UPDATE STORES TABLE FOR STREETSTASHED MVP
-- Run this in your Supabase SQL Editor to fix the stores table

-- 1. Add missing columns to existing stores table
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_time TEXT DEFAULT '45-75 min',
ADD COLUMN IF NOT EXISTS min_order DECIMAL(10,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- 2. Insert sample data (only if table is empty)
INSERT INTO public.stores (name, description, location, rating, review_count, delivery_time, min_order, categories, image, is_verified, active, featured)
SELECT * FROM (VALUES
    ('Urban Threads Collective', 'Premium streetwear and urban fashion from local designers', 'Downtown District', 4.8, 1247, '45-75 min', 25.00, ARRAY['clothing', 'shoes', 'accessories'], 'https://picsum.photos/400/400?random=20', true, true, true),
    ('Sneaker Haven', 'Exclusive sneakers and athletic wear from top brands', 'Sports District', 4.9, 892, '30-60 min', 50.00, ARRAY['shoes', 'clothing'], 'https://picsum.photos/400/400?random=21', true, true, true),
    ('Luxe Jewelry Co.', 'Handcrafted jewelry and luxury accessories', 'Fashion Quarter', 4.7, 567, '60-90 min', 75.00, ARRAY['jewelry', 'accessories'], 'https://picsum.photos/400/400?random=22', true, true, true)
) AS v(name, description, location, rating, review_count, delivery_time, min_order, categories, image, is_verified, active, featured)
WHERE NOT EXISTS (SELECT 1 FROM public.stores WHERE stores.name = v.name);

-- 3. Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'stores'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check the data
SELECT * FROM public.stores LIMIT 5;
