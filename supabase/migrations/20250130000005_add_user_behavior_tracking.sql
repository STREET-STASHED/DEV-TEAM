-- Add User Behavior Tracking for AI Recommendations
-- This migration creates tables to track user behavior for personalized recommendations

-- Create user_behavior table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.user_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'add_to_cart', 'purchase', 'like', 'share')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  category TEXT,
  price NUMERIC(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON public.user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_session_id ON public.user_behavior(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_product_id ON public.user_behavior(product_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON public.user_behavior(action);
CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON public.user_behavior(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_behavior_category ON public.user_behavior(category);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_action ON public.user_behavior(user_id, action);
CREATE INDEX IF NOT EXISTS idx_user_behavior_session_action ON public.user_behavior(session_id, action);
CREATE INDEX IF NOT EXISTS idx_user_behavior_product_action ON public.user_behavior(product_id, action);

-- Enable RLS
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "users_can_view_own_behavior" ON public.user_behavior
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_behavior" ON public.user_behavior
FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "anonymous_can_insert_behavior" ON public.user_behavior
FOR INSERT WITH CHECK (user_id IS NULL);

-- Grant permissions
GRANT ALL ON public.user_behavior TO authenticated;
GRANT ALL ON public.user_behavior TO anon;

-- Create function to clean old anonymous behavior data
CREATE OR REPLACE FUNCTION public.cleanup_old_anonymous_behavior()
RETURNS void AS $$
BEGIN
  -- Delete anonymous behavior older than 30 days
  DELETE FROM public.user_behavior
  WHERE user_id IS NULL
    AND timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user behavior summary
CREATE OR REPLACE FUNCTION public.get_user_behavior_summary(
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  product_id TEXT,
  action TEXT,
  count BIGINT,
  last_action TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ub.product_id,
    ub.action,
    COUNT(*) as count,
    MAX(ub.timestamp) as last_action
  FROM public.user_behavior ub
  WHERE ub.timestamp >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_user_id IS NULL OR ub.user_id = p_user_id)
    AND (p_session_id IS NULL OR ub.session_id = p_session_id)
  GROUP BY ub.product_id, ub.action
  ORDER BY count DESC, last_action DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.cleanup_old_anonymous_behavior() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_behavior_summary(UUID, TEXT, INTEGER) TO authenticated;

-- Create scheduled job to clean old data (runs daily)
SELECT cron.schedule(
  'cleanup-old-anonymous-behavior',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT public.cleanup_old_anonymous_behavior();'
);

-- Add comments
COMMENT ON TABLE public.user_behavior IS 'Tracks user behavior for AI-powered product recommendations';
COMMENT ON COLUMN public.user_behavior.action IS 'Type of user action: view, add_to_cart, purchase, like, share';
COMMENT ON COLUMN public.user_behavior.metadata IS 'Additional context data for the behavior event';
COMMENT ON FUNCTION public.cleanup_old_anonymous_behavior() IS 'Cleans up old anonymous user behavior data';
COMMENT ON FUNCTION public.get_user_behavior_summary(UUID, TEXT, INTEGER) IS 'Gets summary of user behavior for recommendations';
