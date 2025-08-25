-- Social Commerce & Viral Features Migration
-- Creates tables and functions needed for the social commerce system
-- Add missing columns to social_posts table
ALTER TABLE public.social_posts
ADD COLUMN IF NOT EXISTS type TEXT CHECK (
    type IN (
      'outfit',
      'review',
      'challenge',
      'haul',
      'styling'
    )
  ),
  ADD COLUMN IF NOT EXISTS product_ids UUID [] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT [] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS viral_score INTEGER DEFAULT 0;
-- Update existing rows to have a default type
UPDATE public.social_posts
SET type = 'outfit'
WHERE type IS NULL;
-- Add missing columns to social_challenges table
ALTER TABLE public.social_challenges
ADD COLUMN IF NOT EXISTS hashtag TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS prize JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS participants INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS submissions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rules TEXT [] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured_posts UUID [] DEFAULT '{}';
-- Update existing rows to have a default hashtag if needed
UPDATE public.social_challenges
SET hashtag = 'challenge_' || id::text
WHERE hashtag IS NULL;
-- Add missing columns to user_social_profiles table
ALTER TABLE public.user_social_profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS posts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS viral_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_influencer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS categories TEXT [] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
-- Update existing rows to have default values
UPDATE public.user_social_profiles
SET username = 'user_' || user_id::text
WHERE username IS NULL;
UPDATE public.user_social_profiles
SET display_name = 'User'
WHERE display_name IS NULL;
UPDATE public.user_social_profiles
SET is_verified = verified;
-- Add missing columns to social_comments table
ALTER TABLE public.social_comments
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Add missing columns to social_interactions table
ALTER TABLE public.social_interactions
ADD COLUMN IF NOT EXISTS platform TEXT;
-- Add unique constraint if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'social_interactions_user_id_post_id_interaction_type_key'
) THEN
ALTER TABLE public.social_interactions
ADD CONSTRAINT social_interactions_user_id_post_id_interaction_type_key UNIQUE(user_id, post_id, interaction_type);
END IF;
END $$;
-- Add missing columns to social_rewards table
ALTER TABLE public.social_rewards
ADD COLUMN IF NOT EXISTS currency TEXT CHECK (currency IN ('points', 'credits', 'cash')),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
-- Update existing rows to have default values
UPDATE public.social_rewards
SET currency = 'points'
WHERE currency IS NULL;
UPDATE public.social_rewards
SET description = 'Social reward'
WHERE description IS NULL;
UPDATE public.social_rewards
SET status = 'pending'
WHERE status IS NULL;
-- Challenge Participants table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.social_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id, post_id)
);
-- User Follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_viral_score ON public.social_posts(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_type ON public.social_posts(type);
CREATE INDEX IF NOT EXISTS idx_social_posts_tags ON public.social_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_social_challenges_active ON public.social_challenges(active, end_date);
CREATE INDEX IF NOT EXISTS idx_social_challenges_hashtag ON public.social_challenges(hashtag);
CREATE INDEX IF NOT EXISTS idx_user_social_profiles_username ON public.user_social_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_social_profiles_viral_score ON public.user_social_profiles(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON public.social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_post_id ON public.social_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_user_id ON public.social_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
-- RLS Policies for social_posts
CREATE POLICY "Anyone can view social posts" ON public.social_posts FOR
SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.social_posts FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.social_posts FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);
-- RLS Policies for social_challenges
CREATE POLICY "Anyone can view challenges" ON public.social_challenges FOR
SELECT USING (true);
CREATE POLICY "Admins can create challenges" ON public.social_challenges FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_social_profiles
      WHERE user_id = auth.uid()
        AND is_influencer = true
    )
  );
-- RLS Policies for user_social_profiles
CREATE POLICY "Anyone can view user profiles" ON public.user_social_profiles FOR
SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.user_social_profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_social_profiles FOR
UPDATE USING (auth.uid() = user_id);
-- RLS Policies for social_comments
CREATE POLICY "Anyone can view comments" ON public.social_comments FOR
SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.social_comments FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.social_comments FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.social_comments FOR DELETE USING (auth.uid() = user_id);
-- RLS Policies for social_interactions
CREATE POLICY "Users can view their own interactions" ON public.social_interactions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create interactions" ON public.social_interactions FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- RLS Policies for social_rewards
CREATE POLICY "Users can view their own rewards" ON public.social_rewards FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create rewards" ON public.social_rewards FOR
INSERT WITH CHECK (true);
-- RLS Policies for challenge_participants
CREATE POLICY "Anyone can view challenge participants" ON public.challenge_participants FOR
SELECT USING (true);
CREATE POLICY "Users can participate in challenges" ON public.challenge_participants FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- RLS Policies for user_follows
CREATE POLICY "Anyone can view follows" ON public.user_follows FOR
SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.user_follows FOR
INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);
-- Function to calculate viral score
CREATE OR REPLACE FUNCTION public.calculate_viral_score(
    p_likes INTEGER,
    p_shares INTEGER,
    p_comments INTEGER,
    p_views INTEGER,
    p_images_count INTEGER,
    p_products_count INTEGER,
    p_created_at TIMESTAMPTZ
  ) RETURNS INTEGER AS $$
DECLARE time_decay DECIMAL;
engagement_score INTEGER;
reach_score INTEGER;
quality_score INTEGER;
hours_since_creation INTEGER;
BEGIN -- Calculate time decay
hours_since_creation := EXTRACT(
  EPOCH
  FROM (NOW() - p_created_at)
) / 3600;
time_decay := GREATEST(0.1, 1 - (hours_since_creation::DECIMAL / 168));
-- Decay over 1 week
-- Calculate scores
engagement_score := (p_likes * 1) + (p_shares * 3) + (p_comments * 2);
reach_score := FLOOR(p_views * 0.1);
quality_score := (p_images_count * 5) + (p_products_count * 3);
RETURN FLOOR(
  (engagement_score + reach_score + quality_score) * time_decay
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to update viral score for a post
CREATE OR REPLACE FUNCTION public.update_post_viral_score(p_post_id UUID) RETURNS VOID AS $$ BEGIN
UPDATE public.social_posts
SET viral_score = public.calculate_viral_score(
    likes,
    shares,
    comments,
    views,
    ARRAY_LENGTH(images, 1),
    ARRAY_LENGTH(product_ids, 1),
    created_at
  )
WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to get trending posts
CREATE OR REPLACE FUNCTION public.get_trending_posts(p_limit INTEGER DEFAULT 10) RETURNS TABLE (
    id UUID,
    user_id UUID,
    type TEXT,
    content TEXT,
    images TEXT [],
    product_ids UUID [],
    likes INTEGER,
    shares INTEGER,
    comments INTEGER,
    views INTEGER,
    created_at TIMESTAMPTZ,
    tags TEXT [],
    viral_score INTEGER,
    username TEXT,
    display_name TEXT,
    avatar TEXT
  ) AS $$ BEGIN RETURN QUERY
SELECT sp.id,
  sp.user_id,
  sp.type,
  sp.content,
  sp.images,
  sp.product_ids,
  sp.likes,
  sp.shares,
  sp.comments,
  sp.views,
  sp.created_at,
  sp.tags,
  sp.viral_score,
  usp.username,
  usp.display_name,
  usp.avatar
FROM public.social_posts sp
  LEFT JOIN public.user_social_profiles usp ON sp.user_id = usp.user_id
ORDER BY sp.viral_score DESC,
  sp.created_at DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to get user feed
CREATE OR REPLACE FUNCTION public.get_user_feed(p_user_id UUID, p_limit INTEGER DEFAULT 20) RETURNS TABLE (
    id UUID,
    user_id UUID,
    type TEXT,
    content TEXT,
    images TEXT [],
    product_ids UUID [],
    likes INTEGER,
    shares INTEGER,
    comments INTEGER,
    views INTEGER,
    created_at TIMESTAMPTZ,
    tags TEXT [],
    viral_score INTEGER,
    username TEXT,
    display_name TEXT,
    avatar TEXT
  ) AS $$ BEGIN RETURN QUERY
SELECT sp.id,
  sp.user_id,
  sp.type,
  sp.content,
  sp.images,
  sp.product_ids,
  sp.likes,
  sp.shares,
  sp.comments,
  sp.views,
  sp.created_at,
  sp.tags,
  sp.viral_score,
  usp.username,
  usp.display_name,
  usp.avatar
FROM public.social_posts sp
  LEFT JOIN public.user_social_profiles usp ON sp.user_id = usp.user_id
WHERE public.sp.user_id IN (
    SELECT following_id
    FROM public.user_follows
    WHERE follower_id = p_user_id
  )
  OR sp.viral_score > 30
ORDER BY sp.created_at DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to get viral metrics for a user
CREATE OR REPLACE FUNCTION public.get_user_viral_metrics(p_user_id UUID) RETURNS JSONB AS $$
DECLARE total_views INTEGER;
total_likes INTEGER;
total_shares INTEGER;
total_comments INTEGER;
viral_coefficient DECIMAL;
engagement_rate DECIMAL;
reach_score DECIMAL;
influence_score DECIMAL;
result JSONB;
BEGIN -- Get totals
SELECT COALESCE(SUM(views), 0),
  COALESCE(SUM(likes), 0),
  COALESCE(SUM(shares), 0),
  COALESCE(SUM(comments), 0) INTO total_views,
  total_likes,
  total_shares,
  total_comments
FROM public.social_posts
WHERE user_id = p_user_id;
-- Calculate metrics
viral_coefficient := CASE
  WHEN total_views > 0 THEN total_shares::DECIMAL / total_views
  ELSE 0
END;
engagement_rate := CASE
  WHEN total_views > 0 THEN (total_likes + total_comments)::DECIMAL / total_views
  ELSE 0
END;
reach_score := LOG(10, total_views + 1) * 10;
influence_score := (viral_coefficient * 50) + (engagement_rate * 30) + (reach_score * 20);
result := jsonb_build_object(
  'total_views',
  total_views,
  'total_likes',
  total_likes,
  'total_shares',
  total_shares,
  'total_comments',
  total_comments,
  'viral_coefficient',
  viral_coefficient,
  'engagement_rate',
  engagement_rate,
  'reach_score',
  reach_score,
  'influence_score',
  influence_score
);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Triggers to update viral scores
CREATE OR REPLACE FUNCTION public.trigger_update_viral_score() RETURNS TRIGGER AS $$ BEGIN PERFORM public.update_post_viral_score(NEW.id);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_viral_score_trigger
AFTER
INSERT
  OR
UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.trigger_update_viral_score();
-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_social_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_social_posts_updated_at BEFORE
UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_social_updated_at();
CREATE TRIGGER update_social_challenges_updated_at BEFORE
UPDATE ON public.social_challenges FOR EACH ROW EXECUTE FUNCTION public.update_social_updated_at();
CREATE TRIGGER update_user_social_profiles_updated_at BEFORE
UPDATE ON public.user_social_profiles FOR EACH ROW EXECUTE FUNCTION public.update_social_updated_at();
-- Grant permissions
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.social_posts TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE ON public.social_challenges TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE ON public.user_social_profiles TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.social_comments TO authenticated;
GRANT SELECT,
  INSERT ON public.social_interactions TO authenticated;
GRANT SELECT,
  INSERT ON public.social_rewards TO authenticated;
GRANT SELECT,
  INSERT,
  DELETE ON public.challenge_participants TO authenticated;
GRANT SELECT,
  INSERT,
  DELETE ON public.user_follows TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_viral_score TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_post_viral_score TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_posts TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_feed TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_viral_metrics TO authenticated;
-- Insert sample data for testing
INSERT INTO public.social_challenges (
    title,
    description,
    hashtag,
    start_date,
    end_date,
    prize,
    rules
  )
VALUES (
    'Street Style Challenge',
    'Show off your best streetwear looks and win amazing prizes!',
    'streetstashedstyle',
    NOW(),
    NOW() + INTERVAL '30 days',
    '{"type": "products", "value": 500, "description": "$500 worth of streetwear"}',
    ARRAY ['Post must include #streetstashedstyle', 'Must feature StreetStashed products', 'Be creative and authentic']
  ) ON CONFLICT (hashtag) DO NOTHING;