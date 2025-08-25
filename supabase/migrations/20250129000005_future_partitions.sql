-- Future Partitions Migration
-- Adds partitions for the next 12 months to ensure scalability
-- =============================
-- ADDITIONAL PARTITIONS
-- =============================
-- Add partitions for July 2025 through December 2025
CREATE TABLE public.analytics_events_2025_07 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE public.analytics_events_2025_08 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE public.analytics_events_2025_09 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE public.analytics_events_2025_10 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE public.analytics_events_2025_11 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE public.analytics_events_2025_12 PARTITION OF public.analytics_events_partitioned FOR
VALUES
FROM ('2025-12-01') TO ('2026-01-01');
-- Add partitions for orders table
CREATE TABLE public.orders_2025_07 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE public.orders_2025_08 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE public.orders_2025_09 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE public.orders_2025_10 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE public.orders_2025_11 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE public.orders_2025_12 PARTITION OF public.orders_partitioned FOR
VALUES
FROM ('2025-12-01') TO ('2026-01-01');
-- =============================
-- PARTITION INDEXES
-- =============================
-- Add indexes to new partitions for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_2025_07_user_timestamp ON public.analytics_events_2025_07(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_2025_08_user_timestamp ON public.analytics_events_2025_08(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_2025_09_user_timestamp ON public.analytics_events_2025_09(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_2025_10_user_timestamp ON public.analytics_events_2025_10(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_2025_11_user_timestamp ON public.analytics_events_2025_11(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_2025_12_user_timestamp ON public.analytics_events_2025_12(user_id, timestamp DESC);
-- Add indexes to order partitions
CREATE INDEX IF NOT EXISTS idx_orders_2025_07_buyer_status ON public.orders_2025_07(buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_2025_08_buyer_status ON public.orders_2025_08(buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_2025_09_buyer_status ON public.orders_2025_09(buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_2025_10_buyer_status ON public.orders_2025_10(buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_2025_11_buyer_status ON public.orders_2025_11(buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_2025_12_buyer_status ON public.orders_2025_12(buyer_id, status, created_at DESC);
-- =============================
-- PARTITION MONITORING
-- =============================
-- Create a view to monitor partition usage
CREATE OR REPLACE VIEW public.partition_usage_monitor AS
SELECT schemaname,
  tablename,
  attname,
  n_distinct,
  correlation,
  CASE
    WHEN tablename LIKE 'analytics_events_%' THEN 'analytics_events'
    WHEN tablename LIKE 'orders_%' THEN 'orders'
    ELSE 'other'
  END as partition_type,
  CASE
    WHEN tablename LIKE '%2025_%' THEN SUBSTRING(
      tablename
      FROM '(\d{4}_\d{2})'
    )
    ELSE 'unknown'
  END as partition_month
FROM pg_stats
WHERE schemaname = 'public'
  AND (
    tablename LIKE 'analytics_events_%'
    OR tablename LIKE 'orders_%'
  )
ORDER BY tablename,
  attname;
-- Create a function to get partition statistics
CREATE OR REPLACE FUNCTION public.get_partition_statistics() RETURNS TABLE (
    partition_name TEXT,
    table_size TEXT,
    row_count BIGINT,
    partition_type TEXT,
    partition_month TEXT,
    last_updated TIMESTAMPTZ
  ) AS $$ BEGIN RETURN QUERY
SELECT p.tablename::TEXT,
  pg_size_pretty(pg_total_relation_size(p.tablename::regclass))::TEXT,
  p.n_tup_ins + p.n_tup_upd + p.n_tup_del as row_count,
  CASE
    WHEN p.tablename LIKE 'analytics_events_%' THEN 'analytics_events'
    WHEN p.tablename LIKE 'orders_%' THEN 'orders'
    ELSE 'other'
  END::TEXT,
  CASE
    WHEN p.tablename LIKE '%2025_%' THEN SUBSTRING(
      p.tablename
      FROM '(\d{4}_\d{2})'
    )
    ELSE 'unknown'
  END::TEXT,
  p.last_vacuum as last_updated
FROM pg_stat_user_tables p
WHERE p.schemaname = 'public'
  AND (
    p.tablename LIKE 'analytics_events_%'
    OR p.tablename LIKE 'orders_%'
  )
ORDER BY p.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================
-- PARTITION MAINTENANCE
-- =============================
-- Function to vacuum and analyze partitions
CREATE OR REPLACE FUNCTION public.maintain_partitions() RETURNS TABLE (
    partition_name TEXT,
    action TEXT,
    status TEXT,
    message TEXT
  ) AS $$
DECLARE partition_record RECORD;
BEGIN -- Vacuum and analyze all partitions
FOR partition_record IN
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND (
    tablename LIKE 'analytics_events_%'
    OR tablename LIKE 'orders_%'
  ) LOOP BEGIN -- Vacuum the partition
  EXECUTE format(
    'VACUUM ANALYZE public.%I',
    partition_record.tablename
  );
RETURN QUERY
SELECT partition_record.tablename::TEXT,
  'VACUUM_ANALYZE'::TEXT,
  'SUCCESS'::TEXT,
  'Partition maintained successfully'::TEXT;
EXCEPTION
WHEN OTHERS THEN RETURN QUERY
SELECT partition_record.tablename::TEXT,
  'VACUUM_ANALYZE'::TEXT,
  'FAILED'::TEXT,
  SQLERRM::TEXT;
END;
END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================
-- GRANTS
-- =============================
-- Grant permissions on partition monitoring functions
GRANT SELECT ON public.partition_usage_monitor TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_partition_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.maintain_partitions() TO authenticated;
-- Log the completion
SELECT 'Future partitions added successfully' as status;