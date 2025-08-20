-- Driver System Migration
-- Creates comprehensive driver management system

-- Driver profiles table
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  current_order_id UUID REFERENCES orders(id),
  rating DECIMAL(3,2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  completion_rate INTEGER DEFAULT 100 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  total_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  last_location JSONB, -- {lat: number, lng: number}
  last_activity TIMESTAMPTZ DEFAULT now(),
  vehicle_info JSONB, -- {type: string, model: string, color: string}
  insurance_info JSONB, -- {provider: string, policy_number: string}
  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Driver assignments tracking
CREATE TABLE IF NOT EXISTS driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES driver_profiles(user_id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  assignment_method TEXT DEFAULT 'smart_matching' CHECK (assignment_method IN ('manual', 'smart_matching', 'first_come')),
  driver_rating DECIMAL(3,2),
  driver_completion_rate INTEGER,
  assignment_score DECIMAL(3,2), -- How well the driver matched the order
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Driver earnings tracking
CREATE TABLE IF NOT EXISTS driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(user_id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  base_delivery_fee DECIMAL(8,2) NOT NULL,
  distance_bonus DECIMAL(8,2) DEFAULT 0.00,
  time_bonus DECIMAL(8,2) DEFAULT 0.00,
  tip_amount DECIMAL(8,2) DEFAULT 0.00,
  total_earnings DECIMAL(8,2) NOT NULL,
  platform_fee DECIMAL(8,2) NOT NULL,
  driver_payout DECIMAL(8,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Driver availability schedule
CREATE TABLE IF NOT EXISTS driver_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(user_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id, day_of_week)
);

-- Driver performance metrics
CREATE TABLE IF NOT EXISTS driver_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  orders_completed INTEGER DEFAULT 0,
  orders_cancelled INTEGER DEFAULT 0,
  total_distance DECIMAL(8,2) DEFAULT 0.00,
  total_earnings DECIMAL(8,2) DEFAULT 0.00,
  average_delivery_time INTEGER DEFAULT 0, -- in minutes
  customer_rating DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON driver_profiles(is_online, is_available);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_rating ON driver_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_activity ON driver_profiles(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_order ON driver_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver ON driver_earnings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_date ON driver_earnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_schedules_driver ON driver_schedules(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_metrics_driver_date ON driver_metrics(driver_id, date DESC);

-- RLS Policies
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_metrics ENABLE ROW LEVEL SECURITY;

-- Driver profiles policies
CREATE POLICY IF NOT EXISTS driver_profiles_select_own ON driver_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS driver_profiles_update_own ON driver_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS driver_profiles_insert_own ON driver_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for online drivers (for order assignment)
CREATE POLICY IF NOT EXISTS driver_profiles_select_online ON driver_profiles
  FOR SELECT USING (is_online = true);

-- Driver assignments policies
CREATE POLICY IF NOT EXISTS driver_assignments_select_own ON driver_assignments
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY IF NOT EXISTS driver_assignments_select_order_participant ON driver_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = driver_assignments.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY IF NOT EXISTS driver_assignments_insert_authenticated ON driver_assignments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Driver earnings policies
CREATE POLICY IF NOT EXISTS driver_earnings_select_own ON driver_earnings
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY IF NOT EXISTS driver_earnings_insert_authenticated ON driver_earnings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Driver schedules policies
CREATE POLICY IF NOT EXISTS driver_schedules_select_own ON driver_schedules
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY IF NOT EXISTS driver_schedules_insert_own ON driver_schedules
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY IF NOT EXISTS driver_schedules_update_own ON driver_schedules
  FOR UPDATE USING (auth.uid() = driver_id);

-- Driver metrics policies
CREATE POLICY IF NOT EXISTS driver_metrics_select_own ON driver_metrics
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY IF NOT EXISTS driver_metrics_insert_authenticated ON driver_metrics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions for driver management
CREATE OR REPLACE FUNCTION update_driver_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Update driver availability when order status changes
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE driver_profiles 
    SET is_available = true, current_order_id = NULL
    WHERE user_id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update driver availability
CREATE TRIGGER IF NOT EXISTS trigger_update_driver_availability
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_availability();

-- Function to calculate driver rating
CREATE OR REPLACE FUNCTION calculate_driver_rating(driver_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM reviews 
  WHERE subject_type = 'driver' 
  AND subject_id = driver_uuid;
  
  RETURN COALESCE(avg_rating, 5.00);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate driver completion rate
CREATE OR REPLACE FUNCTION calculate_driver_completion_rate(driver_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_orders INTEGER;
  completed_orders INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_orders
  FROM driver_assignments 
  WHERE driver_id = driver_uuid;
  
  SELECT COUNT(*) INTO completed_orders
  FROM driver_assignments 
  WHERE driver_id = driver_uuid 
  AND delivered_at IS NOT NULL;
  
  IF total_orders = 0 THEN
    RETURN 100;
  END IF;
  
  RETURN ROUND((completed_orders::DECIMAL / total_orders::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

-- Function to refresh driver metrics
CREATE OR REPLACE FUNCTION refresh_driver_metrics()
RETURNS VOID AS $$
BEGIN
  -- This would be called by a cron job to update daily metrics
  -- For now, it's a placeholder
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert sample driver profile for testing (optional)
-- INSERT INTO driver_profiles (user_id, is_online, rating, completion_rate) 
-- VALUES ('sample-user-id', true, 4.8, 95)
-- ON CONFLICT (user_id) DO NOTHING;
