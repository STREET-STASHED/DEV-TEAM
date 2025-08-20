-- AI Recommendation System Migration
-- Creates tables and functions needed for the AI recommendation engine

-- User behaviors table for tracking user interactions
CREATE TABLE IF NOT EXISTS user_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'like', 'cart', 'purchase', 'share')),
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_id ON user_behaviors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_product_id ON user_behaviors(product_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_action ON user_behaviors(action);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_session_id ON user_behaviors(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_timestamp ON user_behaviors(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_action ON user_behaviors(user_id, action);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_session ON user_behaviors(user_id, session_id);

-- Enable RLS
ALTER TABLE user_behaviors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own behaviors" ON user_behaviors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behaviors" ON user_behaviors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all behaviors" ON user_behaviors
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- User preferences table for storing learned preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  brand TEXT,
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  style_tags TEXT[],
  weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category, brand)
);

-- Indexes for user preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);
CREATE INDEX IF NOT EXISTS idx_user_preferences_brand ON user_preferences(brand);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Product features table for enhanced product data
CREATE TABLE IF NOT EXISTS product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  brand TEXT,
  style_tags TEXT[],
  condition TEXT,
  popularity_score DECIMAL(5,2) DEFAULT 0,
  trend_score DECIMAL(5,2) DEFAULT 0,
  seasonality TEXT[],
  color_palette TEXT[],
  material TEXT,
  fit_type TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

-- Indexes for product features
CREATE INDEX IF NOT EXISTS idx_product_features_product_id ON product_features(product_id);
CREATE INDEX IF NOT EXISTS idx_product_features_brand ON product_features(brand);
CREATE INDEX IF NOT EXISTS idx_product_features_popularity ON product_features(popularity_score);
CREATE INDEX IF NOT EXISTS idx_product_features_trend ON product_features(trend_score);

-- Enable RLS
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies - public read access for recommendations
CREATE POLICY "Public can view product features" ON product_features
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage their product features" ON product_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = product_features.product_id 
      AND items.seller_id = auth.uid()
    )
  );

-- Recommendation cache table for performance
CREATE TABLE IF NOT EXISTS recommendation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  product_ids UUID[] NOT NULL,
  scores DECIMAL(5,2)[] NOT NULL,
  reasons TEXT[],
  confidence_scores DECIMAL(3,2)[],
  context JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, recommendation_type)
);

-- Indexes for recommendation cache
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON recommendation_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_type ON recommendation_cache(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_expires ON recommendation_cache(expires_at);

-- Enable RLS
ALTER TABLE recommendation_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own cached recommendations" ON recommendation_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all cached recommendations" ON recommendation_cache
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Functions for recommendation system

-- Function to update product popularity score
CREATE OR REPLACE FUNCTION update_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update popularity score based on recent interactions
  UPDATE product_features 
  SET popularity_score = (
    SELECT COUNT(*) * 0.1 + 
           COUNT(*) FILTER (WHERE action = 'purchase') * 0.5 +
           COUNT(*) FILTER (WHERE action = 'like') * 0.3 +
           COUNT(*) FILTER (WHERE action = 'cart') * 0.2
    FROM user_behaviors 
    WHERE product_id = NEW.product_id 
    AND timestamp > now() - interval '30 days'
  ),
  last_updated = now()
  WHERE product_id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update popularity on new behaviors
CREATE TRIGGER update_popularity_on_behavior
  AFTER INSERT ON user_behaviors
  FOR EACH ROW
  EXECUTE FUNCTION update_product_popularity();

-- Function to clean up old recommendation cache
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
  DELETE FROM recommendation_cache 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to get user's top categories
CREATE OR REPLACE FUNCTION get_user_top_categories(user_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE(category TEXT, interaction_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.category,
    COUNT(*) as interaction_count
  FROM user_behaviors ub
  JOIN items i ON ub.product_id = i.id
  WHERE ub.user_id = user_uuid
    AND ub.action IN ('purchase', 'like', 'cart')
    AND ub.timestamp > now() - interval '90 days'
  GROUP BY i.category
  ORDER BY interaction_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get similar users
CREATE OR REPLACE FUNCTION get_similar_users(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(similar_user_id UUID, similarity_score DECIMAL(5,2)) AS $$
BEGIN
  RETURN QUERY
  WITH user_products AS (
    SELECT DISTINCT product_id
    FROM user_behaviors
    WHERE user_id = user_uuid
      AND action IN ('purchase', 'like')
  ),
  similar_users AS (
    SELECT 
      ub.user_id,
      COUNT(*) as overlap_count,
      COUNT(*) * 1.0 / (SELECT COUNT(*) FROM user_products) as similarity_score
    FROM user_behaviors ub
    WHERE ub.product_id IN (SELECT product_id FROM user_products)
      AND ub.user_id != user_uuid
      AND ub.action IN ('purchase', 'like')
    GROUP BY ub.user_id
    HAVING COUNT(*) >= 2
  )
  SELECT 
    similar_users.user_id,
    similar_users.similarity_score
  FROM similar_users
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending products
CREATE OR REPLACE FUNCTION get_trending_products(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(product_id UUID, trend_score DECIMAL(5,2)) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pf.product_id,
    pf.popularity_score + pf.trend_score as trend_score
  FROM product_features pf
  WHERE pf.popularity_score > 0
  ORDER BY (pf.popularity_score + pf.trend_score) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(user_uuid UUID)
RETURNS void AS $$
DECLARE
  user_category TEXT;
  user_brand TEXT;
  avg_price DECIMAL(10,2);
  min_price DECIMAL(10,2);
  max_price DECIMAL(10,2);
BEGIN
  -- Delete existing preferences for this user
  DELETE FROM user_preferences WHERE user_id = user_uuid;
  
  -- Insert category preferences
  FOR user_category IN 
    SELECT DISTINCT i.category
    FROM user_behaviors ub
    JOIN items i ON ub.product_id = i.id
    WHERE ub.user_id = user_uuid
      AND ub.action IN ('purchase', 'like', 'cart')
      AND ub.timestamp > now() - interval '90 days'
  LOOP
    INSERT INTO user_preferences (
      user_id, 
      category, 
      weight, 
      confidence
    ) VALUES (
      user_uuid,
      user_category,
      0.8,
      0.7
    );
  END LOOP;
  
  -- Insert price range preference
  SELECT 
    AVG(i.price),
    MIN(i.price),
    MAX(i.price)
  INTO avg_price, min_price, max_price
  FROM user_behaviors ub
  JOIN items i ON ub.product_id = i.id
  WHERE ub.user_id = user_uuid
    AND ub.action IN ('purchase', 'like', 'cart')
    AND ub.timestamp > now() - interval '90 days';
    
  IF avg_price IS NOT NULL THEN
    INSERT INTO user_preferences (
      user_id,
      price_range_min,
      price_range_max,
      weight,
      confidence
    ) VALUES (
      user_uuid,
      min_price,
      max_price,
      0.9,
      0.8
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Clean up old user behaviors (keep last 2 years)
  DELETE FROM user_behaviors 
  WHERE timestamp < now() - interval '2 years';
  
  -- Clean up expired recommendation cache
  PERFORM cleanup_expired_recommendations();
  
  -- Update all product popularity scores
  UPDATE product_features 
  SET popularity_score = (
    SELECT COUNT(*) * 0.1 + 
           COUNT(*) FILTER (WHERE action = 'purchase') * 0.5 +
           COUNT(*) FILTER (WHERE action = 'like') * 0.3 +
           COUNT(*) FILTER (WHERE action = 'cart') * 0.2
    FROM user_behaviors 
    WHERE product_id = product_features.product_id 
    AND timestamp > now() - interval '30 days'
  ),
  last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create indexes for better performance on existing tables
CREATE INDEX IF NOT EXISTS idx_items_category_price ON items(category, price);
CREATE INDEX IF NOT EXISTS idx_items_seller_active ON items(seller_id, active);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);

-- Add some sample data for testing (optional)
INSERT INTO product_features (product_id, brand, style_tags, condition, popularity_score)
SELECT 
  id,
  'Sample Brand',
  ARRAY['streetwear', 'casual'],
  'excellent',
  1.0
FROM items 
WHERE active = true 
LIMIT 10
ON CONFLICT (product_id) DO NOTHING;
