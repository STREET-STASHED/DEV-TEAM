-- Social Commerce & Viral Features Migration
-- Creates tables and functions needed for the social commerce system

-- Social Posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('outfit', 'review', 'challenge', 'haul', 'styling')),
  content TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  product_ids UUID[] NOT NULL DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  is_sponsored BOOLEAN DEFAULT false,
  viral_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Challenges table
CREATE TABLE IF NOT EXISTS social_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hashtag TEXT NOT NULL UNIQUE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  prize JSONB NOT NULL DEFAULT '{}',
  participants INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  rules TEXT[] NOT NULL DEFAULT '{}',
  featured_posts UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Social Profiles table
CREATE TABLE IF NOT EXISTS user_social_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts INTEGER DEFAULT 0,
  viral_score INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_influencer BOOLEAN DEFAULT false,
  categories TEXT[] DEFAULT '{}',
  location TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Comments table
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Interactions table (for tracking likes, shares, etc.)
CREATE TABLE IF NOT EXISTS social_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'share', 'view', 'comment')),
  platform TEXT, -- for shares (instagram, twitter, etc.)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id, interaction_type)
);

-- Social Rewards table
CREATE TABLE IF NOT EXISTS social_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('referral', 'post', 'challenge', 'engagement', 'viral')),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('points', 'credits', 'cash')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Challenge Participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES social_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id, post_id)
);

-- User Follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_viral_score ON social_posts(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_type ON social_posts(type);
CREATE INDEX IF NOT EXISTS idx_social_posts_tags ON social_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_social_challenges_active ON social_challenges(is_active, end_date);
CREATE INDEX IF NOT EXISTS idx_social_challenges_hashtag ON social_challenges(hashtag);
CREATE INDEX IF NOT EXISTS idx_user_social_profiles_username ON user_social_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_social_profiles_viral_score ON user_social_profiles(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_post_id ON social_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_user_id ON social_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- Enable RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_posts
CREATE POLICY "Anyone can view social posts" ON social_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts" ON social_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON social_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON social_posts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_challenges
CREATE POLICY "Anyone can view challenges" ON social_challenges
  FOR SELECT USING (true);

CREATE POLICY "Admins can create challenges" ON social_challenges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_social_profiles 
      WHERE user_id = auth.uid() AND is_influencer = true
    )
  );

-- RLS Policies for user_social_profiles
CREATE POLICY "Anyone can view user profiles" ON user_social_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON user_social_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_social_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for social_comments
CREATE POLICY "Anyone can view comments" ON social_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON social_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON social_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON social_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_interactions
CREATE POLICY "Users can view their own interactions" ON social_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create interactions" ON social_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for social_rewards
CREATE POLICY "Users can view their own rewards" ON social_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards" ON social_rewards
  FOR INSERT WITH CHECK (true);

-- RLS Policies for challenge_participants
CREATE POLICY "Anyone can view challenge participants" ON challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can participate in challenges" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_follows
CREATE POLICY "Anyone can view follows" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Function to calculate viral score
CREATE OR REPLACE FUNCTION calculate_viral_score(
  p_likes INTEGER,
  p_shares INTEGER,
  p_comments INTEGER,
  p_views INTEGER,
  p_images_count INTEGER,
  p_products_count INTEGER,
  p_created_at TIMESTAMPTZ
) RETURNS INTEGER AS $$
DECLARE
  time_decay DECIMAL;
  engagement_score INTEGER;
  reach_score INTEGER;
  quality_score INTEGER;
  hours_since_creation INTEGER;
BEGIN
  -- Calculate time decay
  hours_since_creation := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 3600;
  time_decay := GREATEST(0.1, 1 - (hours_since_creation::DECIMAL / 168)); -- Decay over 1 week
  
  -- Calculate scores
  engagement_score := (p_likes * 1) + (p_shares * 3) + (p_comments * 2);
  reach_score := FLOOR(p_views * 0.1);
  quality_score := (p_images_count * 5) + (p_products_count * 3);
  
  RETURN FLOOR((engagement_score + reach_score + quality_score) * time_decay);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update viral score for a post
CREATE OR REPLACE FUNCTION update_post_viral_score(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE social_posts 
  SET viral_score = calculate_viral_score(
    likes, shares, comments, views, 
    ARRAY_LENGTH(images, 1), ARRAY_LENGTH(product_ids, 1), created_at
  )
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending posts
CREATE OR REPLACE FUNCTION get_trending_posts(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  content TEXT,
  images TEXT[],
  product_ids UUID[],
  likes INTEGER,
  shares INTEGER,
  comments INTEGER,
  views INTEGER,
  created_at TIMESTAMPTZ,
  tags TEXT[],
  viral_score INTEGER,
  username TEXT,
  display_name TEXT,
  avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
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
  FROM social_posts sp
  LEFT JOIN user_social_profiles usp ON sp.user_id = usp.user_id
  ORDER BY sp.viral_score DESC, sp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user feed
CREATE OR REPLACE FUNCTION get_user_feed(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  content TEXT,
  images TEXT[],
  product_ids UUID[],
  likes INTEGER,
  shares INTEGER,
  comments INTEGER,
  views INTEGER,
  created_at TIMESTAMPTZ,
  tags TEXT[],
  viral_score INTEGER,
  username TEXT,
  display_name TEXT,
  avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
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
  FROM social_posts sp
  LEFT JOIN user_social_profiles usp ON sp.user_id = usp.user_id
  WHERE sp.user_id IN (
    SELECT following_id FROM user_follows WHERE follower_id = p_user_id
  ) OR sp.viral_score > 30
  ORDER BY sp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get viral metrics for a user
CREATE OR REPLACE FUNCTION get_user_viral_metrics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  total_views INTEGER;
  total_likes INTEGER;
  total_shares INTEGER;
  total_comments INTEGER;
  viral_coefficient DECIMAL;
  engagement_rate DECIMAL;
  reach_score DECIMAL;
  influence_score DECIMAL;
  result JSONB;
BEGIN
  -- Get totals
  SELECT 
    COALESCE(SUM(views), 0),
    COALESCE(SUM(likes), 0),
    COALESCE(SUM(shares), 0),
    COALESCE(SUM(comments), 0)
  INTO total_views, total_likes, total_shares, total_comments
  FROM social_posts
  WHERE user_id = p_user_id;
  
  -- Calculate metrics
  viral_coefficient := CASE WHEN total_views > 0 THEN total_shares::DECIMAL / total_views ELSE 0 END;
  engagement_rate := CASE WHEN total_views > 0 THEN (total_likes + total_comments)::DECIMAL / total_views ELSE 0 END;
  reach_score := LOG(10, total_views + 1) * 10;
  influence_score := (viral_coefficient * 50) + (engagement_rate * 30) + (reach_score * 20);
  
  result := jsonb_build_object(
    'total_views', total_views,
    'total_likes', total_likes,
    'total_shares', total_shares,
    'total_comments', total_comments,
    'viral_coefficient', viral_coefficient,
    'engagement_rate', engagement_rate,
    'reach_score', reach_score,
    'influence_score', influence_score
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update viral scores
CREATE OR REPLACE FUNCTION trigger_update_viral_score()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_post_viral_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_viral_score_trigger
  AFTER INSERT OR UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_viral_score();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

CREATE TRIGGER update_social_challenges_updated_at
  BEFORE UPDATE ON social_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

CREATE TRIGGER update_user_social_profiles_updated_at
  BEFORE UPDATE ON user_social_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON social_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON social_challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_social_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_comments TO authenticated;
GRANT SELECT, INSERT ON social_interactions TO authenticated;
GRANT SELECT, INSERT ON social_rewards TO authenticated;
GRANT SELECT, INSERT, DELETE ON challenge_participants TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_follows TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_viral_score TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_viral_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_posts TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_viral_metrics TO authenticated;

-- Insert sample data for testing
INSERT INTO social_challenges (title, description, hashtag, start_date, end_date, prize, rules)
VALUES (
  'Street Style Challenge',
  'Show off your best streetwear looks and win amazing prizes!',
  'streetstashedstyle',
  NOW(),
  NOW() + INTERVAL '30 days',
  '{"type": "products", "value": 500, "description": "$500 worth of streetwear"}',
  ARRAY['Post must include #streetstashedstyle', 'Must feature StreetStashed products', 'Be creative and authentic']
) ON CONFLICT (hashtag) DO NOTHING;
