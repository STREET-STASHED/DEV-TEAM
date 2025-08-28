-- Add Analytics Events Tracking
-- This migration creates tables for tracking analytics events and real-time monitoring

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_timestamp ON public.analytics_events(event_type, timestamp);

-- Create performance_metrics table for system monitoring
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(10,4) NOT NULL,
  metric_unit TEXT,
  tags JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON public.performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_timestamp ON public.performance_metrics(metric_name, timestamp);

-- Create real_time_alerts table for monitoring alerts
CREATE TABLE IF NOT EXISTS public.real_time_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_type ON public.real_time_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_severity ON public.real_time_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_resolved ON public.real_time_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_created ON public.real_time_alerts(created_at);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
CREATE POLICY "users_can_view_own_analytics" ON public.analytics_events
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_analytics" ON public.analytics_events
FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "admins_can_view_all_analytics" ON public.analytics_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Create RLS policies for performance_metrics
CREATE POLICY "admins_can_manage_performance_metrics" ON public.performance_metrics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Create RLS policies for real_time_alerts
CREATE POLICY "admins_can_manage_alerts" ON public.real_time_alerts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Grant permissions
GRANT ALL ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO anon;
GRANT ALL ON public.performance_metrics TO authenticated;
GRANT ALL ON public.real_time_alerts TO authenticated;

-- Create function to get real-time metrics
CREATE OR REPLACE FUNCTION public.get_real_time_metrics(
  p_hours_back INTEGER DEFAULT 1
)
RETURNS TABLE(
  metric_name TEXT,
  current_value NUMERIC,
  previous_value NUMERIC,
  change_percentage NUMERIC,
  trend TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      pm.metric_name,
      AVG(pm.metric_value) as current_value
    FROM public.performance_metrics pm
    WHERE pm.timestamp >= NOW() - (p_hours_back || ' hours')::INTERVAL
    GROUP BY pm.metric_name
  ),
  previous_period AS (
    SELECT 
      pm.metric_name,
      AVG(pm.metric_value) as previous_value
    FROM public.performance_metrics pm
    WHERE pm.timestamp >= NOW() - (p_hours_back * 2 || ' hours')::INTERVAL
      AND pm.timestamp < NOW() - (p_hours_back || ' hours')::INTERVAL
    GROUP BY pm.metric_name
  )
  SELECT 
    cp.metric_name,
    cp.current_value,
    pp.previous_value,
    CASE 
      WHEN pp.previous_value = 0 THEN 0
      ELSE ((cp.current_value - pp.previous_value) / pp.previous_value) * 100
    END as change_percentage,
    CASE 
      WHEN cp.current_value > pp.previous_value THEN 'increasing'
      WHEN cp.current_value < pp.previous_value THEN 'decreasing'
      ELSE 'stable'
    END as trend
  FROM current_period cp
  LEFT JOIN previous_period pp ON cp.metric_name = pp.metric_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track performance metric
CREATE OR REPLACE FUNCTION public.track_performance_metric(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_metric_unit TEXT DEFAULT NULL,
  p_tags JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_metric_id UUID;
BEGIN
  INSERT INTO public.performance_metrics (
    metric_name,
    metric_value,
    metric_unit,
    tags
  ) VALUES (
    p_metric_name,
    p_metric_value,
    p_metric_unit,
    p_tags
  ) RETURNING id INTO v_metric_id;

  RETURN v_metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create alert
CREATE OR REPLACE FUNCTION public.create_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO public.real_time_alerts (
    alert_type,
    severity,
    message,
    metadata
  ) VALUES (
    p_alert_type,
    p_severity,
    p_message,
    p_metadata
  ) RETURNING id INTO v_alert_id;

  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_real_time_metrics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_performance_metric(TEXT, NUMERIC, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_alert(TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- Create scheduled job to clean old analytics data (runs daily)
SELECT cron.schedule(
  'cleanup-old-analytics',
  '0 3 * * *', -- Daily at 3 AM
  'DELETE FROM public.analytics_events WHERE timestamp < NOW() - INTERVAL ''90 days''; DELETE FROM public.performance_metrics WHERE timestamp < NOW() - INTERVAL ''30 days'';'
);

-- Add comments
COMMENT ON TABLE public.analytics_events IS 'Tracks user analytics events for real-time monitoring';
COMMENT ON TABLE public.performance_metrics IS 'Stores system performance metrics for monitoring';
COMMENT ON TABLE public.real_time_alerts IS 'Stores real-time alerts for system monitoring';
COMMENT ON FUNCTION public.get_real_time_metrics(INTEGER) IS 'Gets real-time performance metrics with trend analysis';
COMMENT ON FUNCTION public.track_performance_metric(TEXT, NUMERIC, TEXT, JSONB) IS 'Tracks a performance metric';
COMMENT ON FUNCTION public.create_alert(TEXT, TEXT, TEXT, JSONB) IS 'Creates a real-time alert';
