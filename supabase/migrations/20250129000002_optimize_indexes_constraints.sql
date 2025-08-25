-- Optimize Indexes and Add Missing Constraints
-- Improves database performance and data integrity
-- =============================
-- INDEX OPTIMIZATIONS
-- =============================
-- 1. Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status_created ON public.orders(buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller_status_created ON public.orders(seller_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_driver_status_created ON public.orders(driver_id, status, created_at DESC);
-- 2. Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_type_timestamp ON public.analytics_events(user_id, event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_action_timestamp ON public.user_behaviors(user_id, action, timestamp DESC);
-- 3. Add indexes for social features
CREATE INDEX IF NOT EXISTS idx_social_posts_user_created ON public.social_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_interactions_user_type_created ON public.social_interactions(user_id, interaction_type, created_at DESC);
-- 4. Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, read, created_at DESC);
-- 5. Add indexes for monitoring
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_endpoint_timestamp ON public.monitoring_metrics(endpoint, timestamp DESC);
-- 6. Add partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_products_active_seller ON public.products(seller_id)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_items_active_seller ON public.items(seller_id)
WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_stasher_profiles_available ON public.stasher_profiles(user_id)
WHERE is_available = true
    AND is_online = true;
-- =============================
-- MISSING CONSTRAINTS
-- =============================
-- 1. Add NOT NULL constraints to critical fields
ALTER TABLE public.orders
ALTER COLUMN buyer_id
SET NOT NULL,
    ALTER COLUMN seller_id
SET NOT NULL,
    ALTER COLUMN status
SET NOT NULL,
    ALTER COLUMN items
SET NOT NULL,
    ALTER COLUMN pickup_address
SET NOT NULL,
    ALTER COLUMN delivery_address
SET NOT NULL,
    ALTER COLUMN item_total
SET NOT NULL,
    ALTER COLUMN total_amount
SET NOT NULL;
-- 2. Add constraints to profiles table
ALTER TABLE public.profiles
ALTER COLUMN id
SET NOT NULL,
    ALTER COLUMN created_at
SET NOT NULL;
-- 3. Add constraints to products table
ALTER TABLE public.products
ALTER COLUMN name
SET NOT NULL,
    ALTER COLUMN price
SET NOT NULL,
    ALTER COLUMN seller_id
SET NOT NULL;
-- 4. Add constraints to items table
ALTER TABLE public.items
ALTER COLUMN name
SET NOT NULL,
    ALTER COLUMN price
SET NOT NULL,
    ALTER COLUMN seller_id
SET NOT NULL;
-- 5. Add constraints to social tables
ALTER TABLE public.social_posts
ALTER COLUMN user_id
SET NOT NULL,
    ALTER COLUMN content
SET NOT NULL;
ALTER TABLE public.social_comments
ALTER COLUMN user_id
SET NOT NULL,
    ALTER COLUMN post_id
SET NOT NULL,
    ALTER COLUMN content
SET NOT NULL;
-- 6. Add constraints to notifications table
ALTER TABLE public.notifications
ALTER COLUMN user_id
SET NOT NULL,
    ALTER COLUMN title
SET NOT NULL,
    ALTER COLUMN message
SET NOT NULL,
    ALTER COLUMN type
SET NOT NULL;
-- 7. Add check constraints for data validation
ALTER TABLE public.orders
ADD CONSTRAINT check_order_amounts CHECK (
        item_total >= 0
        AND total_amount >= 0
        AND support_fee_total >= 0
        AND driver_payout >= 0
        AND platform_margin >= 0
    );
ALTER TABLE public.products
ADD CONSTRAINT check_product_price CHECK (price >= 0);
ALTER TABLE public.items
ADD CONSTRAINT check_item_price CHECK (price >= 0);
ALTER TABLE public.stasher_profiles
ADD CONSTRAINT check_stasher_rating CHECK (
        rating >= 0
        AND rating <= 5
    ),
    ADD CONSTRAINT check_stasher_completion_rate CHECK (
        completion_rate >= 0
        AND completion_rate <= 100
    );
-- 8. Add unique constraints where appropriate
ALTER TABLE public.profiles
ADD CONSTRAINT unique_profile_user_id UNIQUE (id);
ALTER TABLE public.seller_profiles
ADD CONSTRAINT unique_seller_user_id UNIQUE (user_id);
ALTER TABLE public.stasher_profiles
ADD CONSTRAINT unique_stasher_user_id UNIQUE (user_id);
ALTER TABLE public.stylist_profiles
ADD CONSTRAINT unique_stylist_user_id UNIQUE (user_id);
-- =============================
-- PERFORMANCE VIEWS
-- =============================
-- 1. Create a view for active orders with driver info
CREATE OR REPLACE VIEW public.active_orders_view AS
SELECT o.id,
    o.buyer_id,
    o.seller_id,
    o.driver_id,
    o.status,
    o.item_total,
    o.total_amount,
    o.created_at,
    o.estimated_delivery_time,
    sp.rating as driver_rating,
    sp.completion_rate as driver_completion_rate
FROM public.orders o
    LEFT JOIN public.stasher_profiles sp ON o.driver_id = sp.id
WHERE o.status NOT IN ('delivered', 'cancelled');
-- 2. Create a view for user activity summary
CREATE OR REPLACE VIEW public.user_activity_summary AS
SELECT p.id as user_id,
    p.username,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(
        DISTINCT CASE
            WHEN o.status = 'delivered' THEN o.id
        END
    ) as completed_orders,
    COUNT(DISTINCT sp.id) as social_posts,
    COUNT(DISTINCT si.id) as social_interactions,
    MAX(o.created_at) as last_order_date,
    MAX(sp.created_at) as last_social_activity
FROM public.profiles p
    LEFT JOIN public.orders o ON p.id = o.buyer_id
    LEFT JOIN public.social_posts sp ON p.id = sp.user_id
    LEFT JOIN public.social_interactions si ON p.id = si.user_id
GROUP BY p.id,
    p.username;
-- =============================
-- FUNCTION OPTIMIZATIONS
-- =============================
-- 1. Create a function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID) RETURNS TABLE (
        total_orders INTEGER,
        completed_orders INTEGER,
        total_spent DECIMAL(10, 2),
        social_posts INTEGER,
        social_interactions INTEGER,
        member_since TIMESTAMPTZ
    ) AS $$ BEGIN RETURN QUERY
SELECT COUNT(DISTINCT o.id)::INTEGER,
    COUNT(
        DISTINCT CASE
            WHEN o.status = 'delivered' THEN o.id
        END
    )::INTEGER,
    COALESCE(
        SUM(
            CASE
                WHEN o.status = 'delivered' THEN o.total_amount
                ELSE 0
            END
        ),
        0
    ),
    COUNT(DISTINCT sp.id)::INTEGER,
    COUNT(DISTINCT si.id)::INTEGER,
    p.created_at
FROM public.profiles p
    LEFT JOIN public.orders o ON p.id = o.buyer_id
    LEFT JOIN public.social_posts sp ON p.id = sp.user_id
    LEFT JOIN public.social_interactions si ON p.id = si.user_id
WHERE p.id = user_uuid
GROUP BY p.id,
    p.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. Create a function to get marketplace statistics
CREATE OR REPLACE FUNCTION public.get_marketplace_stats() RETURNS TABLE (
        total_users INTEGER,
        total_orders INTEGER,
        total_revenue DECIMAL(10, 2),
        active_stashers INTEGER,
        total_products INTEGER
    ) AS $$ BEGIN RETURN QUERY
SELECT COUNT(DISTINCT p.id)::INTEGER,
    COUNT(DISTINCT o.id)::INTEGER,
    COALESCE(
        SUM(
            CASE
                WHEN o.status = 'delivered' THEN o.total_amount
                ELSE 0
            END
        ),
        0
    ),
    COUNT(
        DISTINCT CASE
            WHEN sp.is_available
            AND sp.is_online THEN sp.id
        END
    )::INTEGER,
    COUNT(DISTINCT pr.id)::INTEGER
FROM public.profiles p
    LEFT JOIN public.orders o ON p.id = o.buyer_id
    LEFT JOIN public.stasher_profiles sp ON sp.is_available = true
    LEFT JOIN public.products pr ON pr.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Log the optimization completion
SELECT 'Index and constraint optimizations completed successfully' as status;