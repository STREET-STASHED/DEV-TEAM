-- Extend profiles table with onboarding fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS date_of_birth text,
ADD COLUMN IF NOT EXISTS bio text;

-- Create seller_profiles table for role-specific data
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text,
  business_license text,
  specialties text[],
  experience_years integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create driver_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type text,
  insurance_info text,
  is_online boolean DEFAULT false,
  is_available boolean DEFAULT true,
  rating decimal(3,2) DEFAULT 5.00,
  completion_rate integer DEFAULT 100,
  total_deliveries integer DEFAULT 0,
  total_earnings decimal(10,2) DEFAULT 0.00,
  last_location jsonb,
  last_activity timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create stylist_profiles table
CREATE TABLE IF NOT EXISTS public.stylist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialties text[],
  experience_years integer,
  portfolio_url text,
  services_offered text[],
  hourly_rate decimal(8,2),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_profiles
CREATE POLICY "Users can view their own seller profile" ON public.seller_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile" ON public.seller_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seller profile" ON public.seller_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for driver_profiles
CREATE POLICY "Users can view their own driver profile" ON public.driver_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own driver profile" ON public.driver_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own driver profile" ON public.driver_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for online drivers (for order assignment)
CREATE POLICY "Public can view online drivers" ON public.driver_profiles
  FOR SELECT USING (is_online = true);

-- RLS Policies for stylist_profiles
CREATE POLICY "Users can view their own stylist profile" ON public.stylist_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stylist profile" ON public.stylist_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stylist profile" ON public.stylist_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON public.seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON public.driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stylist_profiles_user_id ON public.stylist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON public.driver_profiles(is_online, is_available);
