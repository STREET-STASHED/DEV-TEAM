-- COMPREHENSIVE DATABASE SETUP FOR STREETSTASHED MVP
-- Run this in your Supabase SQL Editor to create ALL tables needed for the app

-- =====================================================
-- 1. CREATE ALL REQUIRED TABLES
-- =====================================================

-- Create categories table (needed for marketplace)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_style_profiles table
CREATE TABLE IF NOT EXISTS public.user_style_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    style_preferences JSONB DEFAULT '{}',
    size_preferences JSONB DEFAULT '{}',
    color_preferences JSONB DEFAULT '{}',
    brand_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    session_id TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with proper structure
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_cents INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table (needed for order details)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    item_id UUID,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_cents INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    referral_code TEXT,
    reward_points INTEGER DEFAULT 0,
    role TEXT DEFAULT 'buyer',
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referred_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reward_points_awarded INTEGER DEFAULT 0,
    reward_amount DECIMAL(10,2) DEFAULT 0,
    referral_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    level TEXT DEFAULT 'bronze',
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_measurements table
CREATE TABLE IF NOT EXISTS public.user_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    measurements JSONB DEFAULT '{}',
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_challenges table
CREATE TABLE IF NOT EXISTS public.social_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_points INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    hashtag TEXT,
    prize TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personalization_events table
CREATE TABLE IF NOT EXISTS public.personalization_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    item_id UUID,
    metadata JSONB DEFAULT '{}',
    category TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monitoring_metrics table
CREATE TABLE IF NOT EXISTS public.monitoring_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    response_time DECIMAL(10,3),
    error_rate DECIMAL(5,2),
    status_code INTEGER,
    category TEXT,
    subcategory TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    predicted_growth DECIMAL(5,2),
    price_elasticity DECIMAL(5,2),
    p_item_id UUID,
    p_limit INTEGER,
    p_user_id UUID
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL,
    category TEXT,
    condition TEXT,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_posts table
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images TEXT[],
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_interactions table
CREATE TABLE IF NOT EXISTS public.social_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_comments table
CREATE TABLE IF NOT EXISTS public.social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stores table with all required columns
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 0,
    delivery_time TEXT DEFAULT '45-75 min',
    min_order DECIMAL(10,2) DEFAULT 0.0,
    categories TEXT[] DEFAULT '{}',
    image TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_reviews table
CREATE TABLE IF NOT EXISTS public.user_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create push_tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table (needed for trends)
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    category TEXT,
    subcategory TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create leaderboard table (needed for referrals)
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 0,
    category TEXT,
    period TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT INTO public.categories (name, description, image_url) VALUES
    ('clothing', 'Fashion and apparel', 'https://picsum.photos/400/400?random=1'),
    ('shoes', 'Footwear and sneakers', 'https://picsum.photos/400/400?random=2'),
    ('accessories', 'Jewelry, bags, and accessories', 'https://picsum.photos/400/400?random=3'),
    ('streetwear', 'Urban and street fashion', 'https://picsum.photos/400/400?random=4'),
    ('luxury', 'High-end designer items', 'https://picsum.photos/400/400?random=5')
ON CONFLICT (name) DO NOTHING;

-- Insert sample stores data
INSERT INTO public.stores (name, description, location, rating, review_count, delivery_time, min_order, categories, image, is_verified, active, featured) VALUES
    ('Urban Threads Collective', 'Premium streetwear and urban fashion from local designers', 'Downtown District', 4.8, 1247, '45-75 min', 25.00, ARRAY['clothing', 'shoes', 'accessories'], 'https://picsum.photos/400/400?random=20', true, true, true),
    ('Sneaker Haven', 'Exclusive sneakers and athletic wear from top brands', 'Sports District', 4.9, 892, '30-60 min', 50.00, ARRAY['shoes', 'clothing'], 'https://picsum.photos/400/400?random=21', true, true, true),
    ('Luxe Jewelry Co.', 'Handcrafted jewelry and luxury accessories', 'Fashion Quarter', 4.7, 567, '60-90 min', 75.00, ARRAY['jewelry', 'accessories'], 'https://picsum.photos/400/400?random=22', true, true, true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample social challenges
INSERT INTO public.social_challenges (title, description, reward_points, hashtag, prize) VALUES
    ('Street Style Showcase', 'Share your best streetwear looks', 100, '#StreetStashedStyle', 'Featured on homepage'),
    ('Sneaker Collection', 'Show off your sneaker collection', 150, '#SneakerStash', 'Exclusive merch'),
    ('Fashion Transformation', 'Before and after style transformation', 200, '#StyleGlowUp', 'Shopping spree')
ON CONFLICT (title) DO NOTHING;

-- Insert sample analytics data
INSERT INTO public.analytics (metric_name, metric_value, category, subcategory) VALUES
    ('total_users', 1250, 'growth', 'users'),
    ('active_users', 890, 'engagement', 'daily'),
    ('total_orders', 456, 'business', 'orders'),
    ('avg_order_value', 89.99, 'business', 'revenue'),
    ('conversion_rate', 3.2, 'business', 'conversion')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_style_profiles_user_id ON public.user_style_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_user_id ON public.user_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_social_challenges_hashtag ON public.social_challenges(hashtag);
CREATE INDEX IF NOT EXISTS idx_personalization_events_user_id ON public.personalization_events(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_timestamp ON public.monitoring_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_items_seller_id ON public.items(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_post_id ON public.social_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewed_id ON public.user_reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_name ON public.analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard(user_id);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalization_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE BASIC RLS POLICIES
-- =====================================================

-- Public read access for categories and stores
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view stores" ON public.stores
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view social challenges" ON public.social_challenges
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view social posts" ON public.social_posts
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

-- Users can view their own data
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own style profile" ON public.user_style_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view their own rewards" ON public.user_rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own measurements" ON public.user_measurements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own cart items" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.wishlist TO authenticated;
GRANT ALL ON public.user_style_profiles TO authenticated;
GRANT ALL ON public.audit_log TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.disputes TO authenticated;
GRANT ALL ON public.referrals TO authenticated;
GRANT ALL ON public.user_rewards TO authenticated;
GRANT ALL ON public.user_measurements TO authenticated;
GRANT ALL ON public.social_challenges TO authenticated;
GRANT ALL ON public.personalization_events TO authenticated;
GRANT ALL ON public.monitoring_metrics TO authenticated;
GRANT ALL ON public.items TO authenticated;
GRANT ALL ON public.social_posts TO authenticated;
GRANT ALL ON public.social_interactions TO authenticated;
GRANT ALL ON public.social_comments TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.deliveries TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.stores TO authenticated;
GRANT ALL ON public.user_reviews TO authenticated;
GRANT ALL ON public.push_tokens TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT ALL ON public.analytics TO authenticated;
GRANT ALL ON public.leaderboard TO authenticated;

-- =====================================================
-- 7. CREATE ENUMS FOR STATUS FIELDS
-- =====================================================

-- Create enum for order status
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'en_route', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for dispute status
DO $$ BEGIN
    CREATE TYPE dispute_status AS ENUM ('open', 'investigating', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for referral status
DO $$ BEGIN
    CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for delivery status
DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM ('pending', 'picked_up', 'in_transit', 'delivered', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 8. UPDATE EXISTING TABLES WITH PROPER TYPES
-- =====================================================

-- Update orders table to use enum
ALTER TABLE public.orders
    ALTER COLUMN status TYPE order_status USING status::order_status;

-- Update disputes table to use enum
ALTER TABLE public.disputes
    ALTER COLUMN status TYPE dispute_status USING status::dispute_status;

-- Update referrals table to use enum
ALTER TABLE public.referrals
    ALTER COLUMN status TYPE referral_status USING status::referral_status;

-- Update deliveries table to use enum
ALTER TABLE public.deliveries
    ALTER COLUMN delivery_status TYPE delivery_status USING delivery_status::delivery_status;

-- =====================================================
-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_updated_at BEFORE UPDATE ON public.wishlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_style_profiles_updated_at BEFORE UPDATE ON public.user_style_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_rewards_updated_at BEFORE UPDATE ON public.user_rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_measurements_updated_at BEFORE UPDATE ON public.user_measurements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. INSERT DEFAULT PROFILE FOR EXISTING USERS
-- =====================================================

-- Insert a default profile for existing users (if any)
INSERT INTO public.profiles (id, email, full_name)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'User')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- =====================================================
-- 11. VERIFICATION QUERY
-- =====================================================

-- Check that all tables were created successfully
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show table counts
SELECT
    schemaname,
    tablename,
    n_tup_ins as rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
