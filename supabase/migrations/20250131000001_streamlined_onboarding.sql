-- Streamlined Onboarding System Migration
-- Phase 1, 2, 3: Instant onboarding, AI automation, and gamification

-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_confidence decimal(3,2),
ADD COLUMN IF NOT EXISTS risk_score decimal(3,2),
ADD COLUMN IF NOT EXISTS verification_level text CHECK (verification_level IN ('basic', 'standard', 'premium'));

-- Create gamification tables
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  current_level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  xp_to_next_level integer DEFAULT 1000,
  completion_percentage decimal(5,2) DEFAULT 0,
  streak integer DEFAULT 0,
  last_activity timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  category text,
  points integer DEFAULT 0,
  unlocked boolean DEFAULT false,
  unlocked_at timestamp with time zone,
  progress integer DEFAULT 0,
  max_progress integer DEFAULT 1,
  reward_type text,
  reward_value text,
  reward_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  milestone_id text NOT NULL,
  milestone_name text NOT NULL,
  milestone_description text,
  target integer NOT NULL,
  current integer DEFAULT 0,
  reward text,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, milestone_id)
);

CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id text NOT NULL,
  reward_name text NOT NULL,
  reward_type text NOT NULL,
  reward_value text NOT NULL,
  claimed_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  points integer NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create auto-approval tracking table
CREATE TABLE IF NOT EXISTS public.approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  risk_score decimal(3,2),
  confidence_score decimal(3,2),
  auto_approved boolean DEFAULT false,
  verification_required text[],
  restrictions text[],
  approval_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Add verification status to role profiles
ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
ADD COLUMN IF NOT EXISTS auto_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approval_confidence decimal(3,2);

ALTER TABLE public.stylist_profiles 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
ADD COLUMN IF NOT EXISTS auto_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approval_confidence decimal(3,2);

ALTER TABLE public.stasher_profiles 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
ADD COLUMN IF NOT EXISTS auto_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approval_confidence decimal(3,2);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_role ON public.user_progress(role);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON public.achievements(unlocked);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_role ON public.milestones(role);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_id ON public.reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_user_id ON public.approval_history(user_id);

-- Enable RLS on all new tables
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON public.achievements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for milestones
CREATE POLICY "Users can view their own milestones" ON public.milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" ON public.milestones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones" ON public.milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reward_claims
CREATE POLICY "Users can view their own reward claims" ON public.reward_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reward claims" ON public.reward_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for xp_transactions
CREATE POLICY "Users can view their own XP transactions" ON public.xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP transactions" ON public.xp_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for approval_history
CREATE POLICY "Users can view their own approval history" ON public.approval_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own approval history" ON public.approval_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp integer)
RETURNS integer AS $$
BEGIN
  RETURN FLOOR(SQRT(xp / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate XP to next level
CREATE OR REPLACE FUNCTION calculate_xp_to_next_level(current_xp integer)
RETURNS integer AS $$
DECLARE
  current_level integer;
  next_level_xp integer;
BEGIN
  current_level := calculate_level(current_xp);
  next_level_xp := POWER(current_level, 2) * 100;
  RETURN next_level_xp - current_xp;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user progress when XP is added
CREATE OR REPLACE FUNCTION update_user_progress_on_xp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert user progress
  INSERT INTO public.user_progress (user_id, role, total_xp, current_level, xp_to_next_level, last_activity)
  VALUES (
    NEW.user_id,
    (SELECT role FROM public.profiles WHERE id = NEW.user_id),
    COALESCE((SELECT total_xp FROM public.user_progress WHERE user_id = NEW.user_id), 0) + NEW.points,
    calculate_level(COALESCE((SELECT total_xp FROM public.user_progress WHERE user_id = NEW.user_id), 0) + NEW.points),
    calculate_xp_to_next_level(COALESCE((SELECT total_xp FROM public.user_progress WHERE user_id = NEW.user_id), 0) + NEW.points),
    now()
  )
  ON CONFLICT (user_id, role) 
  DO UPDATE SET
    total_xp = user_progress.total_xp + NEW.points,
    current_level = calculate_level(user_progress.total_xp + NEW.points),
    xp_to_next_level = calculate_xp_to_next_level(user_progress.total_xp + NEW.points),
    last_activity = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_progress_on_xp
  AFTER INSERT ON public.xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress_on_xp();

-- Insert default achievements for new users
CREATE OR REPLACE FUNCTION initialize_user_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default achievements for the user
  INSERT INTO public.achievements (user_id, achievement_id, achievement_name, achievement_description, category, points, max_progress)
  VALUES 
    (NEW.id, 'welcome_aboard', 'Welcome Aboard!', 'Complete your account setup', 'onboarding', 100, 1),
    (NEW.id, 'profile_perfect', 'Profile Perfect', 'Complete your profile with photo and bio', 'profile', 150, 3),
    (NEW.id, 'verification_master', 'Verification Master', 'Complete all verification steps', 'verification', 200, 4),
    (NEW.id, 'social_butterfly', 'Social Butterfly', 'Connect your social media accounts', 'social', 100, 3);
  
  -- Insert role-specific achievements
  IF NEW.role = 'seller' THEN
    INSERT INTO public.achievements (user_id, achievement_id, achievement_name, achievement_description, category, points, max_progress)
    VALUES (NEW.id, 'first_sale', 'First Sale', 'Make your first sale as a seller', 'first_action', 300, 1);
  ELSIF NEW.role = 'stylist' THEN
    INSERT INTO public.achievements (user_id, achievement_id, achievement_name, achievement_description, category, points, max_progress)
    VALUES (NEW.id, 'first_client', 'First Client', 'Book your first client as a stylist', 'first_action', 250, 1);
  ELSIF NEW.role = 'driver' THEN
    INSERT INTO public.achievements (user_id, achievement_id, achievement_name, achievement_description, category, points, max_progress)
    VALUES (NEW.id, 'first_delivery', 'First Delivery', 'Complete your first delivery as a stasher', 'first_action', 200, 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_user_achievements
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_achievements();

-- Insert default milestones for new users
CREATE OR REPLACE FUNCTION initialize_user_milestones()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert role-specific milestones
  IF NEW.role = 'seller' THEN
    INSERT INTO public.milestones (user_id, role, milestone_id, milestone_name, milestone_description, target, reward)
    VALUES 
      (NEW.id, 'seller', 'upload_5_products', 'Product Power', 'Upload 5 products to your store', 5, 'Featured placement for 1 week'),
      (NEW.id, 'seller', 'first_10_sales', 'Sales Success', 'Make your first 10 sales', 10, '0% commission for 1 month'),
      (NEW.id, 'seller', 'reach_100_followers', 'Growing Audience', 'Reach 100 followers on your store', 100, 'Advanced analytics access');
  ELSIF NEW.role = 'stylist' THEN
    INSERT INTO public.milestones (user_id, role, milestone_id, milestone_name, milestone_description, target, reward)
    VALUES 
      (NEW.id, 'stylist', 'book_10_clients', 'Client Magnet', 'Book 10 clients', 10, 'Premium stylist badge'),
      (NEW.id, 'stylist', 'earn_5_stars', 'Five Star Stylist', 'Maintain 5-star average rating', 5, 'Featured stylist placement'),
      (NEW.id, 'stylist', 'create_20_outfits', 'Style Creator', 'Create 20 outfit recommendations', 20, 'AI styling tools access');
  ELSIF NEW.role = 'driver' THEN
    INSERT INTO public.milestones (user_id, role, milestone_id, milestone_name, milestone_description, target, reward)
    VALUES 
      (NEW.id, 'driver', 'complete_50_deliveries', 'Delivery Pro', 'Complete 50 deliveries', 50, 'Priority delivery assignments'),
      (NEW.id, 'driver', 'maintain_98_rating', 'Top Performer', 'Maintain 98%+ customer rating', 98, 'Top stasher badge'),
      (NEW.id, 'driver', 'earn_1000_total', 'Earning Champion', 'Earn $1000 total', 1000, 'Bonus delivery zones');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_user_milestones
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_milestones();
