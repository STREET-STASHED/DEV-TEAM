-- StreetStashed Driver System Deployment Script
-- Run this in your Supabase SQL Editor to set up the complete driver system

-- =====================================================
-- 1. DRIVER PROFILES TABLE
-- =====================================================

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

-- =====================================================
-- 2. DRIVER ASSIGNMENTS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES driver_profiles(user_id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  assignment_method TEXT DEFAULT 'smart_matching' CHECK (assignment_method IN ('manual', 'smart_matching', 'first_come', 'auto_first_come', 'cron_auto_assignment')),
  driver_rating DECIMAL(3,2),
  driver_completion_rate INTEGER,
  assignment_score DECIMAL(3,2), -- How well the driver matched the order
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. DRIVER EARNINGS TRACKING
-- =====================================================

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

-- =====================================================
-- 4. DRIVER AVAILABILITY SCHEDULE
-- =====================================================

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

-- =====================================================
-- 5. DRIVER PERFORMANCE METRICS
-- =====================================================

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

-- =====================================================
-- 6. CRON JOB LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  orders_processed INTEGER DEFAULT 0,
  orders_assigned INTEGER DEFAULT 0,
  drivers_available INTEGER DEFAULT 0,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  details JSONB, -- Additional job-specific data
  execution_time_ms INTEGER, -- How long the job took
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 7. UPDATE ORDERS TABLE
-- =====================================================

-- Add driver-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES driver_profiles(user_id),
ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS driver_picked_up_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS driver_delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(8,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS driver_pay DECIMAL(8,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS platform_margin DECIMAL(8,2) DEFAULT 0.00;

-- =====================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Driver profiles indexes
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON driver_profiles(is_online, is_available);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_rating ON driver_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_activity ON driver_profiles(last_activity DESC);

-- Driver assignments indexes
CREATE INDEX IF NOT EXISTS idx_driver_assignments_order ON driver_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON driver_assignments(driver_id);

-- Driver earnings indexes
CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver ON driver_earnings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_date ON driver_earnings(created_at DESC);

-- Driver schedules indexes
CREATE INDEX IF NOT EXISTS idx_driver_schedules_driver ON driver_schedules(driver_id);

-- Driver metrics indexes
CREATE INDEX IF NOT EXISTS idx_driver_metrics_driver_date ON driver_metrics(driver_id, date DESC);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_ready_for_pickup ON orders(status, driver_id) WHERE status = 'ready_for_pickup';

-- Cron job logs indexes
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name ON cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_executed_at ON cron_job_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_success ON cron_job_logs(success);

-- =====================================================
-- 9. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_job_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CREATE RLS POLICIES
-- =====================================================

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

-- Cron job logs policies
CREATE POLICY IF NOT EXISTS cron_job_logs_select_authenticated ON cron_job_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS cron_job_logs_insert_authenticated ON cron_job_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Orders policies (update existing)
CREATE POLICY IF NOT EXISTS orders_select_assigned_driver ON orders
  FOR SELECT USING (
    driver_id = auth.uid() OR 
    buyer_id = auth.uid() OR 
    seller_id = auth.uid()
  );

CREATE POLICY IF NOT EXISTS orders_update_assigned_driver ON orders
  FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY IF NOT EXISTS orders_update_participants ON orders
  FOR UPDATE USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid()
  );

-- =====================================================
-- 11. CREATE FUNCTIONS
-- =====================================================

-- Function to update driver availability when order status changes
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

-- Function to calculate delivery fees and driver pay
CREATE OR REPLACE FUNCTION calculate_order_fees(
  order_distance DECIMAL,
  order_total DECIMAL
) RETURNS TABLE(
  delivery_fee DECIMAL,
  driver_pay DECIMAL,
  platform_margin DECIMAL
) AS $$
BEGIN
  -- Base delivery fee: $5 + $2 per mile
  delivery_fee := 5.00 + (order_distance * 2.00);
  
  -- Driver gets 70% of delivery fee
  driver_pay := delivery_fee * 0.70;
  
  -- Platform margin: 30% of delivery fee
  platform_margin := delivery_fee * 0.30;
  
  RETURN QUERY SELECT delivery_fee, driver_pay, platform_margin;
END;
$$ LANGUAGE plpgsql;

-- Function to update order fees when distance changes
CREATE OR REPLACE FUNCTION update_order_fees()
RETURNS TRIGGER AS $$
DECLARE
  fee_calc RECORD;
BEGIN
  -- Only update if distance changed
  IF OLD.distance_miles IS DISTINCT FROM NEW.distance_miles THEN
    SELECT * INTO fee_calc FROM calculate_order_fees(NEW.distance_miles, NEW.total_amount);
    
    NEW.delivery_fee := fee_calc.delivery_fee;
    NEW.driver_pay := fee_calc.driver_pay;
    NEW.platform_margin := fee_calc.platform_margin;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to clean old cron logs
CREATE OR REPLACE FUNCTION clean_old_cron_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cron_job_logs 
  WHERE executed_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Trigger to automatically update driver availability
CREATE TRIGGER IF NOT EXISTS trigger_update_driver_availability
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_availability();

-- Trigger to automatically update fees when distance changes
CREATE TRIGGER IF NOT EXISTS trigger_update_order_fees
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_fees();

-- =====================================================
-- 13. INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Create a sample driver profile for testing
-- Uncomment and modify the user_id below if you want to test
/*
INSERT INTO driver_profiles (user_id, is_online, rating, completion_rate, total_deliveries, total_earnings)
VALUES (
  'your-user-id-here', -- Replace with actual user ID
  true,
  4.8,
  95,
  0,
  0.00
) ON CONFLICT (user_id) DO NOTHING;
*/

-- =====================================================
-- 14. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
  'driver_profiles' as table_name,
  COUNT(*) as row_count
FROM driver_profiles
UNION ALL
SELECT 
  'driver_assignments' as table_name,
  COUNT(*) as row_count
FROM driver_assignments
UNION ALL
SELECT 
  'driver_earnings' as table_name,
  COUNT(*) as row_count
FROM driver_earnings
UNION ALL
SELECT 
  'driver_schedules' as table_name,
  COUNT(*) as row_count
FROM driver_schedules
UNION ALL
SELECT 
  'driver_metrics' as table_name,
  COUNT(*) as row_count
FROM driver_metrics
UNION ALL
SELECT 
  'cron_job_logs' as table_name,
  COUNT(*) as row_count
FROM cron_job_logs;

-- Check if orders table was updated
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('driver_id', 'delivery_fee', 'driver_pay', 'platform_margin')
ORDER BY column_name;

-- =====================================================
-- DEPLOYMENT COMPLETE! 🎉
-- =====================================================

-- Your driver system is now ready!
-- Next steps:
-- 1. Set up cron job to call /api/cron/auto-assign-orders every 2-5 minutes
-- 2. Test the system with sample orders and drivers
-- 3. Monitor the cron_job_logs table for system health
