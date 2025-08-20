-- Hyper-Personalized Shopping Experience Migration
-- Creates tables and functions for ultra-personalized user experiences

-- User style profiles
CREATE TABLE IF NOT EXISTS user_style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_preferences JSONB NOT NULL DEFAULT '{}',
  body_profile JSONB NOT NULL DEFAULT '{}',
  behavior_profile JSONB NOT NULL DEFAULT '{}',
  context_profile JSONB NOT NULL DEFAULT '{}',
  ai_profile JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Personalization events tracking
CREATE TABLE IF NOT EXISTS personalization_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view', 'like', 'share', 'purchase', 'return', 'search', 
    'filter', 'cart_add', 'cart_remove', 'wishlist_add'
  )),
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  category TEXT,
  price DECIMAL(10, 2),
  context JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Personalized recommendations
CREATE TABLE IF NOT EXISTS personalized_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  score DECIMAL(5, 4) NOT NULL CHECK (score >= 0 AND score <= 1),
  reason TEXT NOT NULL,
  category TEXT NOT NULL,
  personalization_factors JSONB NOT NULL DEFAULT '{}',
  context JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Style moods and emotional states
CREATE TABLE IF NOT EXISTS style_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN (
    'confident', 'casual', 'professional', 'creative', 'comfortable', 'bold'
  )),
  intensity DECIMAL(3, 2) NOT NULL CHECK (intensity >= 0 AND intensity <= 1),
  triggers TEXT[] DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}',
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Personalization insights
CREATE TABLE IF NOT EXISTS personalization_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'style_evolution', 'price_sensitivity', 'brand_loyalty', 
    'seasonal_pattern', 'social_influence', 'context_preference'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  actionable BOOLEAN DEFAULT false,
  action TEXT,
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, preference_type, preference_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_style_profiles_user_id ON user_style_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_personalization_events_user_id ON personalization_events(user_id);
CREATE INDEX IF NOT EXISTS idx_personalization_events_type ON personalization_events(event_type);
CREATE INDEX IF NOT EXISTS idx_personalization_events_created_at ON personalization_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_user_id ON personalized_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_score ON personalized_recommendations(score DESC);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_expires_at ON personalized_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_style_moods_user_id ON style_moods(user_id);
CREATE INDEX IF NOT EXISTS idx_style_moods_created_at ON style_moods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personalization_insights_user_id ON personalization_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_personalization_insights_type ON personalization_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type_key ON user_preferences(preference_type, preference_key);

-- Enable RLS
ALTER TABLE user_style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own style profile" ON user_style_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own style profile" ON user_style_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own style profile" ON user_style_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events" ON personalization_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert events" ON personalization_events
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own recommendations" ON personalized_recommendations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations" ON personalized_recommendations
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own moods" ON style_moods
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own moods" ON style_moods
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own insights" ON personalization_insights
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights" ON personalization_insights
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage their own preferences" ON user_preferences
FOR ALL USING (auth.uid() = user_id);

-- Functions for personalization

-- Function to update user profile from events
CREATE OR REPLACE FUNCTION update_user_profile_from_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's style profile based on the event
  UPDATE user_style_profiles 
  SET 
    updated_at = NOW(),
    ai_profile = jsonb_set(
      ai_profile,
      '{dataPoints}',
      to_jsonb((ai_profile->>'dataPoints')::int + 1)
    )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate personalized recommendations
CREATE OR REPLACE FUNCTION generate_personalized_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  item_id UUID,
  score DECIMAL,
  reason TEXT,
  category TEXT
) AS $$
DECLARE
  user_profile RECORD;
  recent_events RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM user_style_profiles 
  WHERE user_id = p_user_id;
  
  -- Get recent events
  SELECT COUNT(*) as event_count,
         AVG(price) as avg_price,
         MODE() WITHIN GROUP (ORDER BY category) as top_category
  INTO recent_events
  FROM personalization_events 
  WHERE user_id = p_user_id 
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Generate recommendations based on user behavior
  RETURN QUERY
  SELECT 
    i.id as item_id,
    CASE 
      WHEN i.category = recent_events.top_category THEN 0.8
      ELSE 0.6
    END as score,
    CASE 
      WHEN i.category = recent_events.top_category THEN 'Based on your recent interests'
      ELSE 'Discover something new'
    END as reason,
    i.category
  FROM items i
  WHERE i.price BETWEEN 
    GREATEST(0, recent_events.avg_price * 0.5) AND 
    LEAST(1000, recent_events.avg_price * 2.0)
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze user behavior patterns
CREATE OR REPLACE FUNCTION analyze_user_behavior(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  behavior_analysis JSONB;
  event_stats RECORD;
  price_analysis RECORD;
  category_analysis RECORD;
BEGIN
  -- Get event statistics
  SELECT 
    COUNT(*) as total_events,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at)))) as avg_time_between_events
  INTO event_stats
  FROM personalization_events 
  WHERE user_id = p_user_id;
  
  -- Get price analysis
  SELECT 
    AVG(price) as avg_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price,
    MIN(price) as min_price,
    MAX(price) as max_price
  INTO price_analysis
  FROM personalization_events 
  WHERE user_id = p_user_id AND price IS NOT NULL;
  
  -- Get category analysis
  SELECT 
    jsonb_object_agg(category, count) as category_distribution
  INTO category_analysis
  FROM (
    SELECT category, COUNT(*) as count
    FROM personalization_events 
    WHERE user_id = p_user_id AND category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
    LIMIT 10
  ) cat_counts;
  
  -- Build behavior analysis
  behavior_analysis := jsonb_build_object(
    'engagement', jsonb_build_object(
      'total_events', event_stats.total_events,
      'active_days', event_stats.active_days,
      'avg_time_between_events', event_stats.avg_time_between_events
    ),
    'price_behavior', jsonb_build_object(
      'avg_price', price_analysis.avg_price,
      'median_price', price_analysis.median_price,
      'price_range', jsonb_build_object(
        'min', price_analysis.min_price,
        'max', price_analysis.max_price
      )
    ),
    'category_preferences', category_analysis.category_distribution
  );
  
  RETURN behavior_analysis;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user insights
CREATE OR REPLACE FUNCTION get_user_insights(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  insight_type TEXT,
  title TEXT,
  description TEXT,
  confidence DECIMAL,
  actionable BOOLEAN,
  impact TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.insight_type,
    pi.title,
    pi.description,
    pi.confidence,
    pi.actionable,
    pi.impact
  FROM personalization_insights pi
  WHERE pi.user_id = p_user_id
  ORDER BY pi.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER update_profile_on_event
  AFTER INSERT ON personalization_events
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_from_event();

CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_style_profiles TO authenticated;
GRANT SELECT, INSERT ON personalization_events TO authenticated;
GRANT SELECT, INSERT ON personalized_recommendations TO authenticated;
GRANT SELECT, INSERT ON style_moods TO authenticated;
GRANT SELECT, INSERT ON personalization_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;

GRANT EXECUTE ON FUNCTION generate_personalized_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_user_behavior TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_insights TO authenticated;

-- Insert sample data for testing
INSERT INTO user_style_profiles (user_id, style_preferences, body_profile, behavior_profile, context_profile, ai_profile)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  '{"aesthetic": ["streetwear", "minimalist"], "colorPalette": ["neutral", "bold"], "fitPreference": "fitted", "priceRange": {"min": 20, "max": 200, "preferred": 80}}',
  '{"height": 175, "weight": 70, "bodyType": "athletic", "sizePreferences": {"tops": "M", "bottoms": "M", "shoes": "10"}}',
  '{"browsingPatterns": {"preferredTime": ["evening"], "sessionDuration": 20, "devicePreference": "mobile"}}',
  '{"location": {"climate": "temperate"}, "lifestyle": {"activityLevel": "active"}}',
  '{"learningRate": 0.1, "confidenceScore": 0.7, "dataPoints": 50, "accuracyScore": 0.8}'
) ON CONFLICT DO NOTHING;
