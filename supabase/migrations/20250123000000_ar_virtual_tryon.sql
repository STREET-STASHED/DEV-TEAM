-- AR Virtual Try-On System Migration
-- Creates tables and functions needed for the AR virtual try-on system

-- AR Sessions table for tracking try-on sessions
CREATE TABLE IF NOT EXISTS ar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER DEFAULT 0, -- in milliseconds
  final_result JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AR Interactions table for tracking user interactions during try-on
CREATE TABLE IF NOT EXISTS ar_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'rotate', 'zoom', 'color_change', 'size_change')),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Measurements table for storing user body measurements
CREATE TABLE IF NOT EXISTS user_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  height DECIMAL(5,2), -- in inches
  weight DECIMAL(5,2), -- in pounds
  chest DECIMAL(5,2), -- in inches
  waist DECIMAL(5,2), -- in inches
  hips DECIMAL(5,2), -- in inches
  shoulders DECIMAL(5,2), -- in inches
  inseam DECIMAL(5,2), -- in inches
  body_type TEXT CHECK (body_type IN ('athletic', 'slim', 'regular', 'plus')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product AR Data table for storing AR-specific product information
CREATE TABLE IF NOT EXISTS product_ar_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE UNIQUE,
  ar_model_url TEXT, -- 3D model URL
  size_chart JSONB NOT NULL DEFAULT '{}',
  colors JSONB NOT NULL DEFAULT '[]',
  fit_type TEXT DEFAULT 'regular' CHECK (fit_type IN ('loose', 'regular', 'tight')),
  material TEXT DEFAULT 'cotton',
  measurements JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ar_sessions_user_id ON ar_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_product_id ON ar_sessions(product_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_start_time ON ar_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_session_id ON ar_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_type ON ar_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_measurements_user_id ON user_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_product_ar_data_product_id ON product_ar_data(product_id);

-- Enable RLS
ALTER TABLE ar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ar_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ar_sessions
CREATE POLICY "Users can view their own AR sessions" ON ar_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AR sessions" ON ar_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AR sessions" ON ar_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ar_interactions
CREATE POLICY "Users can view interactions for their sessions" ON ar_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ar_sessions 
      WHERE ar_sessions.id = ar_interactions.session_id 
      AND ar_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create interactions for their sessions" ON ar_interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ar_sessions 
      WHERE ar_sessions.id = ar_interactions.session_id 
      AND ar_sessions.user_id = auth.uid()
    )
  );

-- RLS Policies for user_measurements
CREATE POLICY "Users can view their own measurements" ON user_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own measurements" ON user_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" ON user_measurements
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for product_ar_data
CREATE POLICY "Anyone can view product AR data" ON product_ar_data
  FOR SELECT USING (true);

CREATE POLICY "Sellers can create AR data for their products" ON product_ar_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = product_ar_data.product_id 
      AND items.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update AR data for their products" ON product_ar_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = product_ar_data.product_id 
      AND items.seller_id = auth.uid()
    )
  );

-- Function to calculate fit score
CREATE OR REPLACE FUNCTION calculate_fit_score(
  user_measurement DECIMAL,
  product_measurement DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  difference DECIMAL;
  tolerance DECIMAL;
BEGIN
  difference := ABS(user_measurement - product_measurement);
  tolerance := product_measurement * 0.1; -- 10% tolerance
  
  IF difference <= tolerance THEN
    RETURN 1.0;
  ELSIF difference <= tolerance * 2 THEN
    RETURN 0.8;
  ELSIF difference <= tolerance * 3 THEN
    RETURN 0.6;
  ELSE
    RETURN 0.4;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user fit recommendations
CREATE OR REPLACE FUNCTION get_fit_recommendations(
  p_user_id UUID,
  p_product_id UUID,
  p_size TEXT
) RETURNS JSONB AS $$
DECLARE
  user_measurements RECORD;
  product_ar_data RECORD;
  size_chart JSONB;
  product_measurements JSONB;
  chest_fit DECIMAL;
  waist_fit DECIMAL;
  shoulders_fit DECIMAL;
  average_fit DECIMAL;
  confidence DECIMAL;
  fit_category TEXT;
  recommendations TEXT[];
  result JSONB;
BEGIN
  -- Get user measurements
  SELECT * INTO user_measurements 
  FROM user_measurements 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'error', 'User measurements not found',
      'recommendations', ARRAY['Please add your measurements to get personalized fit recommendations']
    );
  END IF;
  
  -- Get product AR data
  SELECT * INTO product_ar_data 
  FROM product_ar_data 
  WHERE product_id = p_product_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'error', 'Product AR data not found',
      'recommendations', ARRAY['Product data not available']
    );
  END IF;
  
  -- Get size chart
  size_chart := product_ar_data.size_chart;
  product_measurements := size_chart->p_size;
  
  IF product_measurements IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Size not found',
      'recommendations', ARRAY['Size not available']
    );
  END IF;
  
  -- Calculate fit scores
  chest_fit := calculate_fit_score(user_measurements.chest, (product_measurements->>'chest')::DECIMAL);
  waist_fit := calculate_fit_score(user_measurements.waist, (product_measurements->>'waist')::DECIMAL);
  shoulders_fit := calculate_fit_score(user_measurements.shoulders, (product_measurements->>'shoulders')::DECIMAL);
  
  average_fit := (chest_fit + waist_fit + shoulders_fit) / 3;
  confidence := LEAST(average_fit * 100, 100);
  
  -- Determine fit category
  IF confidence >= 90 THEN
    fit_category := 'perfect';
  ELSIF confidence >= 70 THEN
    fit_category := 'good';
  ELSIF confidence >= 50 THEN
    fit_category := 'loose';
  ELSE
    fit_category := 'tight';
  END IF;
  
  -- Generate recommendations
  recommendations := ARRAY[]::TEXT[];
  
  IF fit_category = 'tight' THEN
    recommendations := array_append(recommendations, 'Consider sizing up for a more comfortable fit');
    recommendations := array_append(recommendations, 'This item runs small - try the next size');
  ELSIF fit_category = 'loose' THEN
    recommendations := array_append(recommendations, 'Consider sizing down for a more fitted look');
    recommendations := array_append(recommendations, 'This item runs large - try the smaller size');
  ELSIF fit_category = 'perfect' THEN
    recommendations := array_append(recommendations, 'Perfect fit! This size is ideal for you');
    recommendations := array_append(recommendations, 'Great choice - the measurements align perfectly');
  END IF;
  
  -- Add specific recommendations
  IF user_measurements.chest > (product_measurements->>'chest')::DECIMAL + 2 THEN
    recommendations := array_append(recommendations, 'Chest measurement suggests sizing up');
  END IF;
  
  IF user_measurements.waist > (product_measurements->>'waist')::DECIMAL + 2 THEN
    recommendations := array_append(recommendations, 'Waist measurement suggests sizing up');
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'size', p_size,
    'fit', fit_category,
    'confidence', confidence,
    'measurements', product_measurements,
    'recommendations', recommendations
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get AR session analytics
CREATE OR REPLACE FUNCTION get_ar_analytics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  total_sessions INTEGER;
  avg_duration DECIMAL;
  recent_sessions JSONB;
  result JSONB;
BEGIN
  -- Get total sessions
  SELECT COUNT(*) INTO total_sessions
  FROM ar_sessions
  WHERE user_id = p_user_id;
  
  -- Get average duration
  SELECT AVG(duration) INTO avg_duration
  FROM ar_sessions
  WHERE user_id = p_user_id;
  
  -- Get recent sessions
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'product_id', product_id,
      'start_time', start_time,
      'duration', duration,
      'final_result', final_result
    )
  ) INTO recent_sessions
  FROM ar_sessions
  WHERE user_id = p_user_id
  ORDER BY start_time DESC
  LIMIT 5;
  
  result := jsonb_build_object(
    'total_sessions', total_sessions,
    'average_duration', avg_duration,
    'recent_sessions', COALESCE(recent_sessions, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ar_sessions TO authenticated;
GRANT SELECT, INSERT ON ar_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON product_ar_data TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_fit_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_fit_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION get_ar_analytics TO authenticated;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_measurements_updated_at
  BEFORE UPDATE ON user_measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_updated_at();

CREATE TRIGGER update_product_ar_data_updated_at
  BEFORE UPDATE ON product_ar_data
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_updated_at();

-- Insert sample data for testing
INSERT INTO product_ar_data (product_id, size_chart, colors, measurements)
SELECT 
  id,
  jsonb_build_object(
    'xs', jsonb_build_object('chest', 32, 'waist', 26, 'hips', 34, 'length', 26, 'shoulders', 14),
    's', jsonb_build_object('chest', 34, 'waist', 28, 'hips', 36, 'length', 26, 'shoulders', 15),
    'm', jsonb_build_object('chest', 36, 'waist', 30, 'hips', 38, 'length', 26, 'shoulders', 16),
    'l', jsonb_build_object('chest', 38, 'waist', 32, 'hips', 40, 'length', 26, 'shoulders', 17),
    'xl', jsonb_build_object('chest', 40, 'waist', 34, 'hips', 42, 'length', 26, 'shoulders', 18),
    'xxl', jsonb_build_object('chest', 42, 'waist', 36, 'hips', 44, 'length', 26, 'shoulders', 19)
  ),
  jsonb_build_array(
    jsonb_build_object('name', 'Black', 'hex', '#000000', 'image', image),
    jsonb_build_object('name', 'White', 'hex', '#FFFFFF', 'image', image),
    jsonb_build_object('name', 'Navy', 'hex', '#000080', 'image', image)
  ),
  jsonb_build_object('chest', 36, 'waist', 30, 'hips', 38, 'length', 26, 'shoulders', 16)
FROM items
WHERE id NOT IN (SELECT product_id FROM product_ar_data)
LIMIT 10
ON CONFLICT (product_id) DO NOTHING;
