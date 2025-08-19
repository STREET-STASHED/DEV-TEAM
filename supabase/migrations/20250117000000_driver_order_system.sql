-- 🚀 StreetStashed Driver & Order System
-- This migration creates the complete driver and order management system

-- Create driver_profiles table
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  vehicle_info JSONB NOT NULL DEFAULT '{}',
  current_location JSONB NOT NULL DEFAULT '{"latitude": 0, "longitude": 0}',
  is_available BOOLEAN DEFAULT true NOT NULL,
  current_order_id UUID,
  driver_tier TEXT DEFAULT 'Bronze' CHECK (driver_tier IN ('Bronze', 'Silver', 'Gold', 'Diamond')),
  completed_orders INTEGER DEFAULT 0 NOT NULL,
  total_earnings DECIMAL(10,2) DEFAULT 0 NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create driver_stats table
CREATE TABLE IF NOT EXISTS driver_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES driver_profiles(id) ON DELETE CASCADE NOT NULL,
  total_orders INTEGER DEFAULT 0 NOT NULL,
  completed_orders INTEGER DEFAULT 0 NOT NULL,
  cancelled_orders INTEGER DEFAULT 0 NOT NULL,
  total_earnings DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_distance DECIMAL(8,2) DEFAULT 0 NOT NULL,
  average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  tier TEXT DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Diamond')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES driver_profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled')) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  pickup_address JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  distance_miles DECIMAL(6,2) NOT NULL,
  item_total DECIMAL(10,2) NOT NULL,
  support_fee_total DECIMAL(10,2) NOT NULL,
  driver_payout DECIMAL(10,2) NOT NULL,
  platform_margin DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_instructions TEXT,
  estimated_delivery_time TEXT,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_is_available ON driver_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_current_order_id ON driver_profiles(current_order_id);
CREATE INDEX IF NOT EXISTS idx_driver_stats_driver_id ON driver_stats(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_stats_updated_at BEFORE UPDATE ON driver_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for driver_profiles
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Drivers can view own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can update own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can insert own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Admins can view all driver profiles" ON driver_profiles;

-- Drivers can view and update their own profile
CREATE POLICY "Drivers can view own profile" ON driver_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can update own profile" ON driver_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Drivers can insert own profile" ON driver_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all driver profiles
CREATE POLICY "Admins can view all driver profiles" ON driver_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for driver_stats
ALTER TABLE driver_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Drivers can view own stats" ON driver_stats;
DROP POLICY IF EXISTS "Admins can view all driver stats" ON driver_stats;

-- Drivers can view their own stats
CREATE POLICY "Drivers can view own stats" ON driver_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM driver_profiles WHERE id = driver_stats.driver_id AND user_id = auth.uid()
    )
  );

-- Admins can view all driver stats
CREATE POLICY "Admins can view all driver stats" ON driver_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Buyers can view own orders" ON orders;
DROP POLICY IF EXISTS "Sellers can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Drivers can view available orders" ON orders;
DROP POLICY IF EXISTS "Buyers can insert own orders" ON orders;
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Buyers can view their own orders
CREATE POLICY "Buyers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = buyer_id);

-- Sellers can view orders assigned to them
CREATE POLICY "Sellers can view assigned orders" ON orders
  FOR SELECT USING (auth.uid() = seller_id);

-- Drivers can view orders assigned to them
CREATE POLICY "Drivers can view assigned orders" ON orders
  FOR SELECT USING (
    driver_id IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM driver_profiles WHERE id = orders.driver_id AND user_id = auth.uid()
    )
  );

-- Drivers can view available orders (pending without driver)
CREATE POLICY "Drivers can view available orders" ON orders
  FOR SELECT USING (
    status = 'pending' AND driver_id IS NULL
  );

-- Buyers can insert their own orders
CREATE POLICY "Buyers can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Drivers can update orders assigned to them
CREATE POLICY "Drivers can update assigned orders" ON orders
  FOR UPDATE USING (
    driver_id IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM driver_profiles WHERE id = orders.driver_id AND user_id = auth.uid()
    )
  );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );
