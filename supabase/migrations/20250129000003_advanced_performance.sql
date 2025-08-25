-- Advanced Performance Optimizations
-- Implements table partitioning and materialized views for long-term scalability
-- =============================
-- TABLE PARTITIONING
-- =============================
-- 1. Create partitioned analytics_events table by month
CREATE TABLE IF NOT EXISTS public.analytics_events_partitioned (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    event_type TEXT NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT now(),
    properties JSONB,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
) PARTITION BY RANGE (timestamp);
-- Create partitions for the next 12 months
CREATE TABLE public.analytics_events_2025_01 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE public.analytics_events_2025_02 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE public.analytics_events_2025_03 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE public.analytics_events_2025_04 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE public.analytics_events_2025_05 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE public.analytics_events_2025_06 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-06-01') TO ('2025-07-01');
-- 2. Create partitioned orders table by month
CREATE TABLE IF NOT EXISTS public.orders_partitioned (
    id UUID DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.stasher_profiles(id) ON DELETE
    SET NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        items JSONB NOT NULL,
        pickup_address JSONB NOT NULL,
        delivery_address JSONB NOT NULL,
        item_total DECIMAL(10, 2) NOT NULL,
        support_fee_total DECIMAL(10, 2) DEFAULT 0,
        driver_payout DECIMAL(10, 2) DEFAULT 0,
        platform_margin DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        estimated_delivery_time TIMESTAMPTZ,
        actual_delivery_time TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
-- Create partitions for the next 12 months
CREATE TABLE public.orders_2025_01 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE public.orders_2025_02 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE public.orders_2025_03 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE public.orders_2025_04 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE public.orders_2025_05 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE public.orders_2025_06 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-06-01') TO ('2025-07-01');
-- =============================
-- MATERIALIZED VIEWS
-- =============================
-- 1. Daily marketplace statistics
CREATE MATERIALIZED VIEW public.daily_marketplace_stats AS
SELECT DATE(created_at) as date,
    COUNT(DISTINCT buyer_id) as unique_buyers,
    COUNT(DISTINCT seller_id) as unique_sellers,
    COUNT(*) as total_orders,
    COUNT(
        CASE
            WHEN status = 'delivered' THEN 1
        END
    ) as completed_orders,
    SUM(
        CASE
            WHEN status = 'delivered' THEN total_amount
            ELSE 0
        END
    ) as total_revenue,
    AVG(
        CASE
            WHEN status = 'delivered' THEN total_amount
            ELSE NULL
        END
    ) as avg_order_value,
    COUNT(DISTINCT driver_id) as active_stashers
FROM public.orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
-- Create unique index for refresh
CREATE UNIQUE INDEX idx_daily_marketplace_stats_date ON public.daily_marketplace_stats(date);
-- 2. User engagement metrics
CREATE MATERIALIZED VIEW public.user_engagement_metrics AS
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
    COUNT(DISTINCT n.id) as notifications_received,
    COUNT(
        DISTINCT CASE
            WHEN n.read = true THEN n.id
        END
    ) as notifications_read,
    MAX(o.created_at) as last_order_date,
    MAX(sp.created_at) as last_social_activity,
    MAX(n.created_at) as last_notification_date,
    CASE
        WHEN MAX(o.created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 'active'
        WHEN MAX(o.created_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 'recent'
        ELSE 'inactive'
    END as engagement_level
FROM public.profiles p
    LEFT JOIN public.orders o ON p.id = o.buyer_id
    LEFT JOIN public.social_posts sp ON p.id = sp.user_id
    LEFT JOIN public.social_interactions si ON p.id = si.user_id
    LEFT JOIN public.notifications n ON p.id = n.user_id
GROUP BY p.id,
    p.username;
-- Create unique index for refresh
CREATE UNIQUE INDEX idx_user_engagement_metrics_user_id ON public.user_engagement_metrics(user_id);
-- 3. Product performance metrics
CREATE MATERIALIZED VIEW public.product_performance_metrics AS
SELECT pr.id as product_id,
    pr.name as product_name,
    pr.seller_id,
    pr.price,
    COUNT(DISTINCT oi.order_id) as times_ordered,
    COUNT(DISTINCT o.buyer_id) as unique_buyers,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.total_price) as avg_order_value,
    0 as total_reviews,
    0.0 as avg_rating,
    MAX(o.created_at) as last_ordered_date
FROM public.products pr
    LEFT JOIN public.order_items oi ON pr.id = oi.product_id
    LEFT JOIN public.orders o ON oi.order_id = o.id
WHERE pr.is_active = true
GROUP BY pr.id,
    pr.name,
    pr.seller_id,
    pr.price;
-- Create unique index for refresh
CREATE UNIQUE INDEX idx_product_performance_metrics_product_id ON public.product_performance_metrics(product_id);
-- 4. Stasher performance metrics
CREATE MATERIALIZED VIEW public.stasher_performance_metrics AS
SELECT sp.id as stasher_id,
    sp.user_id,
    sp.rating,
    sp.completion_rate,
    sp.total_deliveries,
    sp.total_earnings,
    COUNT(DISTINCT o.id) as total_orders_assigned,
    COUNT(
        DISTINCT CASE
            WHEN o.status = 'delivered' THEN o.id
        END
    ) as completed_deliveries,
    AVG(
        CASE
            WHEN o.status = 'delivered' THEN o.driver_payout
            ELSE NULL
        END
    ) as avg_payout_per_delivery,
    SUM(
        CASE
            WHEN o.status = 'delivered' THEN o.driver_payout
            ELSE 0
        END
    ) as total_payouts,
    MAX(o.created_at) as last_delivery_date,
    CASE
        WHEN sp.is_online
        AND sp.is_available THEN 'online'
        WHEN sp.is_available THEN 'available'
        ELSE 'offline'
    END as current_status
FROM public.stasher_profiles sp
    LEFT JOIN public.orders o ON sp.id = o.driver_id
GROUP BY sp.id,
    sp.user_id,
    sp.rating,
    sp.completion_rate,
    sp.total_deliveries,
    sp.total_earnings,
    sp.is_online,
    sp.is_available;
-- Create unique index for refresh
CREATE UNIQUE INDEX idx_stasher_performance_metrics_stasher_id ON public.stasher_performance_metrics(stasher_id);
-- =============================
-- REFRESH FUNCTIONS
-- =============================
-- 1. Function to refresh all materialized views
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views() RETURNS void AS $$ BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_marketplace_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_engagement_metrics;
REFRESH MATERIALIZED VIEW CONCURRENTLY public.product_performance_metrics;
REFRESH MATERIALIZED VIEW CONCURRENTLY public.stasher_performance_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. Function to refresh specific materialized view
CREATE OR REPLACE FUNCTION public.refresh_materialized_view(view_name TEXT) RETURNS void AS $$ BEGIN CASE
        view_name
        WHEN 'daily_marketplace_stats' THEN REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_marketplace_stats;
WHEN 'user_engagement_metrics' THEN REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_engagement_metrics;
WHEN 'product_performance_metrics' THEN REFRESH MATERIALIZED VIEW CONCURRENTLY public.product_performance_metrics;
WHEN 'stasher_performance_metrics' THEN REFRESH MATERIALIZED VIEW CONCURRENTLY public.stasher_performance_metrics;
ELSE RAISE EXCEPTION 'Unknown materialized view: %',
view_name;
END CASE
;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================
-- PARTITION MANAGEMENT FUNCTIONS
-- =============================
-- 1. Function to create new monthly partitions
CREATE OR REPLACE FUNCTION public.create_monthly_partitions(target_month DATE) RETURNS void AS $$
DECLARE partition_name TEXT;
start_date DATE;
end_date DATE;
BEGIN -- Set start and end dates for the month
start_date := DATE_TRUNC('month', target_month);
end_date := start_date + INTERVAL '1 month';
-- Create analytics_events partition
partition_name := 'analytics_events_' || TO_CHAR(start_date, 'YYYY_MM');
EXECUTE format(
    'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.analytics_events_partitioned FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    start_date,
    end_date
);
-- Create orders partition
partition_name := 'orders_' || TO_CHAR(start_date, 'YYYY_MM');
EXECUTE format(
    'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.orders_partitioned FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    start_date,
    end_date
);
RAISE NOTICE 'Created partitions for month: %',
target_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. Function to drop old partitions (older than 12 months)
CREATE OR REPLACE FUNCTION public.drop_old_partitions() RETURNS void AS $$
DECLARE partition_name TEXT;
partition_record RECORD;
BEGIN -- Drop old analytics_events partitions
FOR partition_record IN
SELECT tablename
FROM pg_tables
WHERE tablename LIKE 'analytics_events_%'
    AND tablename < 'analytics_events_' || TO_CHAR(CURRENT_DATE - INTERVAL '12 months', 'YYYY_MM') LOOP EXECUTE format(
        'DROP TABLE IF EXISTS public.%I',
        partition_record.tablename
    );
RAISE NOTICE 'Dropped partition: %',
partition_record.tablename;
END LOOP;
-- Drop old orders partitions
FOR partition_record IN
SELECT tablename
FROM pg_tables
WHERE tablename LIKE 'orders_%'
    AND tablename < 'orders_' || TO_CHAR(CURRENT_DATE - INTERVAL '12 months', 'YYYY_MM') LOOP EXECUTE format(
        'DROP TABLE IF EXISTS public.%I',
        partition_record.tablename
    );
RAISE NOTICE 'Dropped partition: %',
partition_record.tablename;
END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================
-- GRANTS
-- =============================
-- Grant permissions on materialized views
GRANT SELECT ON public.daily_marketplace_stats TO authenticated;
GRANT SELECT ON public.user_engagement_metrics TO authenticated;
GRANT SELECT ON public.product_performance_metrics TO authenticated;
GRANT SELECT ON public.stasher_performance_metrics TO authenticated;
-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.refresh_all_materialized_views() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_materialized_view(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_monthly_partitions(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.drop_old_partitions() TO authenticated;
-- Log the completion
SELECT 'Advanced performance optimizations completed successfully' as status;