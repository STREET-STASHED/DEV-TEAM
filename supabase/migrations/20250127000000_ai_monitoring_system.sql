-- 🤖 AI Production Monitoring System Database Schema
-- Stores metrics, alerts, and insights for production sustainability

-- Monitoring metrics table
CREATE TABLE IF NOT EXISTS public.monitoring_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  endpoint TEXT NOT NULL,
  response_time INTEGER NOT NULL, -- milliseconds
  status_code INTEGER NOT NULL,
  error_rate DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
  user_count INTEGER NOT NULL,
  memory_usage DECIMAL(10,2) NOT NULL, -- MB
  cpu_usage DECIMAL(5,2) NOT NULL, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Monitoring alerts table
CREATE TABLE IF NOT EXISTS public.monitoring_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('performance', 'security', 'user_experience', 'scalability')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Monitoring insights table
CREATE TABLE IF NOT EXISTS public.monitoring_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('performance', 'security', 'user_experience', 'scalability')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  confidence DECIMAL(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance trends table for historical analysis
CREATE TABLE IF NOT EXISTS public.performance_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  avg_response_time DECIMAL(10,2) NOT NULL,
  avg_error_rate DECIMAL(5,4) NOT NULL,
  total_requests INTEGER NOT NULL,
  unique_users INTEGER NOT NULL,
  peak_concurrent_users INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User behavior analytics table
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  page_visited TEXT NOT NULL,
  time_spent INTEGER NOT NULL, -- seconds
  actions_performed JSONB, -- array of user actions
  device_info JSONB, -- browser, OS, device type
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System health snapshots
CREATE TABLE IF NOT EXISTS public.system_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  memory_usage DECIMAL(10,2) NOT NULL, -- MB
  cpu_usage DECIMAL(5,2) NOT NULL, -- percentage
  disk_usage DECIMAL(5,2) NOT NULL, -- percentage
  network_latency DECIMAL(10,2) NOT NULL, -- ms
  active_connections INTEGER NOT NULL,
  database_connections INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_timestamp ON public.monitoring_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_endpoint ON public.monitoring_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_timestamp ON public.monitoring_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON public.monitoring_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_type ON public.monitoring_alerts(type);
CREATE INDEX IF NOT EXISTS idx_monitoring_insights_timestamp ON public.monitoring_insights(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_trends_date ON public.performance_trends(date);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON public.user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON public.user_behavior_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_health_timestamp ON public.system_health_snapshots(timestamp);

-- Enable Row Level Security
ALTER TABLE public.monitoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monitoring data
-- Admins can view all monitoring data
CREATE POLICY "Admins can view all monitoring data" ON public.monitoring_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all alerts" ON public.monitoring_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all insights" ON public.monitoring_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all trends" ON public.performance_trends
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all user behavior" ON public.user_behavior_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all system health" ON public.system_health_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert monitoring data (for automated monitoring)
CREATE POLICY "System can insert monitoring data" ON public.monitoring_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert alerts" ON public.monitoring_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert insights" ON public.monitoring_insights
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert trends" ON public.performance_trends
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert user behavior" ON public.user_behavior_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert system health" ON public.system_health_snapshots
  FOR INSERT WITH CHECK (true);

-- Function to clean old monitoring data (keep last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_monitoring_data()
RETURNS void AS $$
BEGIN
  DELETE FROM public.monitoring_metrics 
  WHERE timestamp < now() - interval '30 days';
  
  DELETE FROM public.monitoring_alerts 
  WHERE timestamp < now() - interval '30 days';
  
  DELETE FROM public.monitoring_insights 
  WHERE timestamp < now() - interval '30 days';
  
  DELETE FROM public.performance_trends 
  WHERE date < current_date - interval '30 days';
  
  DELETE FROM public.user_behavior_analytics 
  WHERE timestamp < now() - interval '30 days';
  
  DELETE FROM public.system_health_snapshots 
  WHERE timestamp < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get system health summary
CREATE OR REPLACE FUNCTION public.get_system_health_summary()
RETURNS TABLE (
  avg_response_time DECIMAL(10,2),
  avg_error_rate DECIMAL(5,4),
  total_alerts INTEGER,
  critical_alerts INTEGER,
  uptime_percentage DECIMAL(5,2),
  active_users INTEGER,
  system_load DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(m.response_time), 0) as avg_response_time,
    COALESCE(AVG(m.error_rate), 0) as avg_error_rate,
    COUNT(DISTINCT a.id) as total_alerts,
    COUNT(DISTINCT CASE WHEN a.severity = 'critical' THEN a.id END) as critical_alerts,
    CASE 
      WHEN COUNT(m.id) > 0 THEN 
        (COUNT(CASE WHEN m.status_code < 400 THEN 1 END)::DECIMAL / COUNT(m.id) * 100)
      ELSE 100 
    END as uptime_percentage,
    COALESCE(MAX(m.user_count), 0) as active_users,
    COALESCE(AVG(s.cpu_usage), 0) as system_load
  FROM public.monitoring_metrics m
  LEFT JOIN public.monitoring_alerts a ON a.timestamp >= now() - interval '24 hours'
  LEFT JOIN public.system_health_snapshots s ON s.timestamp >= now() - interval '1 hour'
  WHERE public.m.timestamp >= now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to get performance trends
CREATE OR REPLACE FUNCTION public.get_performance_trends(days INTEGER DEFAULT 7)
RETURNS TABLE (
  date DATE,
  avg_response_time DECIMAL(10,2),
  avg_error_rate DECIMAL(5,4),
  total_requests INTEGER,
  unique_users INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.date,
    p.avg_response_time,
    p.avg_error_rate,
    p.total_requests,
    p.unique_users
  FROM public.performance_trends p
  WHERE public.p.date >= current_date - (days || ' days')::INTERVAL
  ORDER BY p.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO public.monitoring_metrics (
  timestamp, endpoint, response_time, status_code, error_rate, user_count, memory_usage, cpu_usage
) VALUES 
  (now() - interval '1 hour', '/', 150, 200, 0, 25, 512.5, 35.2),
  (now() - interval '30 minutes', '/api/items', 89, 200, 0, 30, 523.1, 38.7),
  (now() - interval '15 minutes', '/buyer/checkout', 120, 200, 0, 28, 518.9, 36.4),
  (now(), '/signup', 95, 200, 0, 32, 525.3, 39.1);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
