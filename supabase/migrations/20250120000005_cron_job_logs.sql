-- Cron Job Logs Migration
-- Creates table to track automated job executions
-- Cron job logs table
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    orders_processed INTEGER DEFAULT 0,
    orders_assigned INTEGER DEFAULT 0,
    drivers_available INTEGER DEFAULT 0,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    details JSONB,
    -- Additional job-specific data
    execution_time_ms INTEGER,
    -- How long the job took
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name ON public.cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_executed_at ON public.cron_job_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_success ON public.cron_job_logs(success);
-- RLS Policies
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;
-- Only authenticated users can read logs
CREATE POLICY cron_job_logs_select_authenticated ON public.cron_job_logs FOR
SELECT USING (auth.role() = 'authenticated');
-- Only authenticated users can insert logs
CREATE POLICY cron_job_logs_insert_authenticated ON public.cron_job_logs FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- Function to clean old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION public.clean_old_cron_logs() RETURNS INTEGER AS $$
DECLARE 
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.cron_job_logs
    WHERE executed_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
-- Function to get cron job statistics
CREATE OR REPLACE FUNCTION public.get_cron_job_stats(
    job_name_filter TEXT DEFAULT NULL,
    days_back INTEGER DEFAULT 7
) RETURNS TABLE(
    job_name TEXT,
    total_executions INTEGER,
    successful_executions INTEGER,
    failed_executions INTEGER,
    success_rate DECIMAL(5, 2),
    avg_orders_assigned DECIMAL(5, 2),
    last_execution TIMESTAMPTZ
) AS $$ 
BEGIN 
    RETURN QUERY
    SELECT 
        cjl.job_name,
        COUNT(*)::INTEGER as total_executions,
        COUNT(*) FILTER (WHERE public.cjl.success)::INTEGER as successful_executions,
        COUNT(*) FILTER (WHERE NOT cjl.success)::INTEGER as failed_executions,
        ROUND(
            (COUNT(*) FILTER (WHERE public.cjl.success)::DECIMAL / COUNT(*)::DECIMAL) * 100,
            2
        ) as success_rate,
        ROUND(AVG(cjl.orders_assigned), 2) as avg_orders_assigned,
        MAX(cjl.executed_at) as last_execution
    FROM public.cron_job_logs cjl
    WHERE public.cjl.executed_at >= NOW() - (days_back || ' days')::INTERVAL
        AND (
            job_name_filter IS NULL
            OR cjl.job_name = job_name_filter
        )
    GROUP BY cjl.job_name
    ORDER BY cjl.job_name;
END;
$$ LANGUAGE plpgsql;
-- Insert sample data for testing (optional)
-- INSERT INTO public.cron_job_logs (job_name, orders_processed, orders_assigned, drivers_available, success, details)
-- VALUES (
--   'auto_assign_orders',
--   5,
--   3,
--   8,
--   true,
--   '{"assignments": [{"order_id": "sample-1", "driver_id": "driver-1"}]}'
-- );