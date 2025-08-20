-- MANUAL MIGRATION - Run this in Supabase SQL Editor
-- 1. Fix profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS email text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
-- 2. Fix trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.profiles (
    id,
    role,
    full_name,
    username,
    email,
    has_completed_onboarding,
    details_complete,
    onboarding_step
  )
VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.email,
    false,
    false,
    'role'
  );
RETURN new;
EXCEPTION
WHEN OTHERS THEN RAISE WARNING 'Error in handle_new_user trigger: %',
SQLERRM;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
-- 3. Create onboarding tables
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT,
  business_description TEXT,
  business_address JSONB,
  business_phone TEXT,
  business_email TEXT,
  tax_id TEXT,
  business_license TEXT,
  payment_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.stasher_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  license_number TEXT NOT NULL,
  license_state TEXT NOT NULL,
  license_expiry DATE NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  license_plate TEXT NOT NULL,
  insurance_provider TEXT NOT NULL,
  insurance_policy_number TEXT NOT NULL,
  insurance_expiry DATE NOT NULL,
  vehicle_color TEXT,
  vehicle_vin TEXT,
  is_available BOOLEAN DEFAULT true NOT NULL,
  current_location JSONB DEFAULT '{"latitude": 0, "longitude": 0}',
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (
    rating >= 0
    AND rating <= 5
  ),
  completed_deliveries INTEGER DEFAULT 0 NOT NULL,
  total_earnings DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.stylist_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bio TEXT,
  specialties TEXT [],
  experience_years INTEGER,
  portfolio_url TEXT,
  social_media JSONB,
  availability_schedule JSONB,
  consultation_fee DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (
    rating >= 0
    AND rating <= 5
  ),
  completed_appointments INTEGER DEFAULT 0 NOT NULL,
  total_earnings DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON public.seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stasher_profiles_user_id ON public.stasher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stylist_profiles_user_id ON public.stylist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stasher_profiles_is_available ON public.stasher_profiles(is_available);
-- 5. Enable RLS
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stasher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_profiles ENABLE ROW LEVEL SECURITY;
-- 6. Create RLS policies
CREATE POLICY "Users can view own seller profile" ON public.seller_profiles FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own seller profile" ON public.seller_profiles FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own seller profile" ON public.seller_profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own stasher profile" ON public.stasher_profiles FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stasher profile" ON public.stasher_profiles FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stasher profile" ON public.stasher_profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view available stashers" ON public.stasher_profiles FOR
SELECT USING (is_available = true);
CREATE POLICY "Users can view own stylist profile" ON public.stylist_profiles FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stylist profile" ON public.stylist_profiles FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stylist profile" ON public.stylist_profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view stylist profiles" ON public.stylist_profiles FOR
SELECT USING (true);
-- 7. Grant permissions
GRANT SELECT,
  INSERT,
  UPDATE ON public.seller_profiles TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE ON public.stasher_profiles TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE ON public.stylist_profiles TO authenticated;
GRANT SELECT ON public.seller_profiles TO anon;
GRANT SELECT ON public.stasher_profiles TO anon;
GRANT SELECT ON public.stylist_profiles TO anon;
-- 8. Refresh schema cache
NOTIFY pgrst,
'reload schema';