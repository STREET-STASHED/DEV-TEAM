-- 🚀 StreetStashed Trust & Polish Features Migration (Clean)
-- Add dispute resolution, notifications, referrals, and verification systems
-- This migration only adds new features without conflicting with existing tables
-- =============================
-- DEBUG: CHECK TABLE STRUCTURES
-- =============================
-- Let's verify the table structures before proceeding
DO $$ BEGIN RAISE NOTICE 'Checking orders table structure...';
RAISE NOTICE 'Orders table columns: %',
(
  SELECT string_agg(column_name || ' ' || data_type, ', ')
  FROM information_schema.columns
  WHERE table_name = 'orders'
    AND table_schema = 'public'
);
RAISE NOTICE 'Checking profiles table structure...';
RAISE NOTICE 'Profiles table columns: %',
(
  SELECT string_agg(column_name || ' ' || data_type, ', ')
  FROM information_schema.columns
  WHERE table_name = 'profiles'
    AND table_schema = 'public'
);
END $$;
-- =============================
-- ADD SELLER_ID TO ORDERS TABLE
-- =============================
-- First, add seller_id to orders table since disputes need it
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS seller_id uuid;
-- Update seller_id for existing orders by joining through order_items and products
UPDATE public.orders
SET seller_id = p.seller_id
FROM public.order_items oi
  JOIN public.products p ON oi.product_id = p.id
WHERE oi.order_id = orders.id
  AND orders.seller_id IS NULL;
-- =============================
-- DISPUTES TABLE
-- =============================
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'resolved', 'denied', 'escalated')
  ),
  resolution_notes text,
  escalated_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- Add foreign key constraints after table creation
ALTER TABLE public.disputes
ADD CONSTRAINT disputes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.disputes
ADD CONSTRAINT disputes_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.disputes
ADD CONSTRAINT disputes_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
-- =============================
-- REFERRALS TABLE
-- =============================
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'expired')
  ),
  reward_points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);
-- Add foreign key constraints after table creation
ALTER TABLE public.referrals
ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.referrals
ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
-- =============================
-- EXTEND PROFILES TABLE
-- =============================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_docs text [],
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_rejection_reason text,
  ADD COLUMN IF NOT EXISTS reward_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
-- Create index for referral code
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
-- Add comments
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether user has completed KYC verification';
COMMENT ON COLUMN public.profiles.verification_docs IS 'Array of verification document URLs';
COMMENT ON COLUMN public.profiles.reward_points IS 'Reward points earned (1 point = $10 spent)';
COMMENT ON COLUMN public.profiles.referral_code IS 'Unique referral code for inviting friends';
-- =============================
-- RLS POLICIES
-- =============================
-- Enable RLS on new tables
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
-- Disputes policies
CREATE POLICY "Buyers can view their own disputes" ON public.disputes FOR
SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view disputes for their orders" ON public.disputes FOR
SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can create disputes" ON public.disputes FOR
INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update dispute status" ON public.disputes FOR
UPDATE USING (auth.uid() = seller_id);
-- Referrals policies
CREATE POLICY "Users can view their own referrals" ON public.referrals FOR
SELECT USING (
    auth.uid() = referrer_id
    OR auth.uid() = referred_id
  );
CREATE POLICY "Users can create referrals" ON public.referrals FOR
INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Users can update their referrals" ON public.referrals FOR
UPDATE USING (
    auth.uid() = referrer_id
    OR auth.uid() = referred_id
  );
-- Admin bypass policies
CREATE POLICY "Admin bypass - disputes" ON public.disputes FOR ALL USING (  
  EXISTS (                                                                  
    SELECT 1                                                                
    FROM public.profiles p                                                  
    WHERE p.id = auth.uid()                                          
      AND p.role = 'admin'                                                  
  )                                                                         
);
CREATE POLICY "Admin bypass - referrals" ON public.referrals FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);
-- =============================
-- FUNCTIONS
-- =============================
-- Function to award referral points
CREATE OR REPLACE FUNCTION public.award_referral_points(p_referrer_id uuid, p_referred_id uuid) RETURNS void AS $$ BEGIN -- Award 50 points to referrer when referred user places first order
UPDATE public.profiles
SET reward_points = reward_points + 50
WHERE id = p_referrer_id;
-- Mark referral as completed
UPDATE public.referrals
SET status = 'completed',
  reward_points_awarded = 50,
  updated_at = NOW()
WHERE referrer_id = p_referrer_id
  AND referred_id = p_referred_id
  AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code() RETURNS text AS $$
DECLARE referral_code text;
attempts integer := 0;
max_attempts integer := 10;
BEGIN LOOP -- Generate a random 8-character code
referral_code := 'REF-' || upper(
  substring(
    md5(random()::text)
    from 1 for 8
  )
);
-- Check if it's unique
IF NOT EXISTS (
  SELECT 1
  FROM public.profiles
  WHERE referral_code = referral_code
) THEN RETURN referral_code;
END IF;
attempts := attempts + 1;
IF attempts >= max_attempts THEN RAISE EXCEPTION 'Failed to generate unique referral code after % attempts',
max_attempts;
END IF;
END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================
-- GRANTS
-- =============================
-- Grant permissions on new tables
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.disputes TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.referrals TO authenticated;
-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.award_referral_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_referral_code TO authenticated;
-- =============================
-- INDEXES
-- =============================
-- Performance indexes for disputes
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer_id ON public.disputes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_seller_id ON public.disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON public.disputes(created_at);
-- Performance indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at);
-- =============================
-- TRIGGERS
-- =============================
-- Trigger to automatically update updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Add updated_at triggers to new tables
CREATE TRIGGER set_disputes_updated_at BEFORE
UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_referrals_updated_at BEFORE
UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- =============================
-- MIGRATION COMPLETE
-- =============================
SELECT 'Trust & Polish Features Migration completed successfully' as status;