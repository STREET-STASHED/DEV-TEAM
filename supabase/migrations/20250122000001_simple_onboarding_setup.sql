-- Simple onboarding setup - no dependencies
-- This migration only creates the onboarding-related tables and fields

-- 1. Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS date_of_birth text,
ADD COLUMN IF NOT EXISTS bio text;

-- 2. Create seller_profiles table
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text,
  business_license text,
  business_address text,
  business_phone text,
  business_type text CHECK (business_type IN ('retail', 'wholesale', 'online', 'brick_mortar', 'other')),
  specialties text[],
  experience_years integer,
  tax_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Create stasher_profiles table (replaces driver_profiles)
CREATE TABLE IF NOT EXISTS public.stasher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_license text,
  license_plate text,
  vehicle_type text,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  insurance_provider text,
  insurance_policy_number text,
  insurance_expiry text,
  background_check_consent boolean DEFAULT false,
  is_online boolean DEFAULT false,
  is_available boolean DEFAULT true,
  rating decimal(3, 2) DEFAULT 5.00,
  completion_rate integer DEFAULT 100,
  total_deliveries integer DEFAULT 0,
  total_earnings decimal(10, 2) DEFAULT 0.00,
  last_location jsonb,
  last_activity timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- 4. Create stylist_profiles table
CREATE TABLE IF NOT EXISTS public.stylist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialties text[],
  experience_years integer,
  portfolio_url text,
  services_offered text[],
  hourly_rate decimal(8, 2),
  availability text CHECK (availability IN ('full_time', 'part_time', 'weekends_only', 'by_appointment')),
  certifications text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Enable Row Level Security
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stasher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for seller_profiles
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own seller profile" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can update their own seller profile" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can insert their own seller profile" ON public.seller_profiles;

CREATE POLICY "Users can view their own seller profile" ON public.seller_profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile" ON public.seller_profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seller profile" ON public.seller_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Create RLS policies for stasher_profiles
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own stasher profile" ON public.stasher_profiles;
DROP POLICY IF EXISTS "Users can update their own stasher profile" ON public.stasher_profiles;
DROP POLICY IF EXISTS "Users can insert their own stasher profile" ON public.stasher_profiles;

CREATE POLICY "Users can view their own stasher profile" ON public.stasher_profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stasher profile" ON public.stasher_profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stasher profile" ON public.stasher_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Create RLS policies for stylist_profiles
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own stylist profile" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Users can update their own stylist profile" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Users can insert their own stylist profile" ON public.stylist_profiles;

CREATE POLICY "Users can view their own stylist profile" ON public.stylist_profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stylist profile" ON public.stylist_profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stylist profile" ON public.stylist_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON public.seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stasher_profiles_user_id ON public.stasher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stylist_profiles_user_id ON public.stylist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stasher_profiles_available ON public.stasher_profiles(is_available, is_online);

-- 10. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
