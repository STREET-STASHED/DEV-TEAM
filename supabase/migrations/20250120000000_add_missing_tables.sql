-- Add missing tables that are referenced in the codebase

-- USER BEHAVIORS table for AI recommendations
CREATE TABLE IF NOT EXISTS public.user_behaviors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  action text not null check (action in ('view', 'like', 'purchase', 'cart_add', 'cart_remove')),
  session_id text,
  timestamp timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS user_behaviors_user_id_idx ON public.user_behaviors (user_id);
CREATE INDEX IF NOT EXISTS user_behaviors_product_id_idx ON public.user_behaviors (product_id);
CREATE INDEX IF NOT EXISTS user_behaviors_action_idx ON public.user_behaviors (action);
CREATE INDEX IF NOT EXISTS user_behaviors_timestamp_idx ON public.user_behaviors (timestamp);

-- Enable RLS
ALTER TABLE public.user_behaviors ENABLE ROW LEVEL SECURITY;

-- RLS: users can only see their own behaviors
CREATE POLICY user_behaviors_user_policy ON public.user_behaviors
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ANALYTICS EVENTS table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  session_id text,
  timestamp timestamptz default now(),
  ip_address inet,
  user_agent text
);

CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON public.analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON public.analytics_events (timestamp);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS: users can only see their own events, admins can see all
CREATE POLICY analytics_events_user_policy ON public.analytics_events
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY analytics_events_insert_policy ON public.analytics_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- SOCIAL TABLES
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  images text[],
  likes int default 0,
  shares int default 0,
  views int default 0,
  comments int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS social_posts_user_id_idx ON public.social_posts (user_id);
CREATE INDEX IF NOT EXISTS social_posts_created_at_idx ON public.social_posts (created_at);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- RLS: public can view, users can manage their own posts
CREATE POLICY social_posts_view_policy ON public.social_posts
  FOR SELECT USING (true);

CREATE POLICY social_posts_manage_policy ON public.social_posts
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SOCIAL INTERACTIONS table
CREATE TABLE IF NOT EXISTS public.social_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.social_posts(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('like', 'share', 'view', 'comment')),
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS social_interactions_user_id_idx ON public.social_interactions (user_id);
CREATE INDEX IF NOT EXISTS social_interactions_post_id_idx ON public.social_interactions (post_id);

-- Enable RLS
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;

-- RLS: users can manage their own interactions
CREATE POLICY social_interactions_policy ON public.social_interactions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SOCIAL COMMENTS table
CREATE TABLE IF NOT EXISTS public.social_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.social_posts(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS social_comments_user_id_idx ON public.social_comments (user_id);
CREATE INDEX IF NOT EXISTS social_comments_post_id_idx ON public.social_comments (post_id);

-- Enable RLS
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;

-- RLS: public can view, users can manage their own comments
CREATE POLICY social_comments_view_policy ON public.social_comments
  FOR SELECT USING (true);

CREATE POLICY social_comments_manage_policy ON public.social_comments
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SOCIAL CHALLENGES table
CREATE TABLE IF NOT EXISTS public.social_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  reward_points int default 0,
  start_date timestamptz default now(),
  end_date timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS social_challenges_active_idx ON public.social_challenges (active);

-- Enable RLS
ALTER TABLE public.social_challenges ENABLE ROW LEVEL SECURITY;

-- RLS: public can view active challenges
CREATE POLICY social_challenges_view_policy ON public.social_challenges
  FOR SELECT USING (true);

-- SOCIAL REWARDS table
CREATE TABLE IF NOT EXISTS public.social_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.social_posts(id) on delete cascade,
  points int not null,
  reason text,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS social_rewards_user_id_idx ON public.social_rewards (user_id);

-- Enable RLS
ALTER TABLE public.social_rewards ENABLE ROW LEVEL SECURITY;

-- RLS: users can view their own rewards
CREATE POLICY social_rewards_policy ON public.social_rewards
  FOR SELECT USING (user_id = auth.uid());

-- USER SOCIAL PROFILES table
CREATE TABLE IF NOT EXISTS public.user_social_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  username text,
  followers_count int default 0,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS user_social_profiles_user_id_idx ON public.user_social_profiles (user_id);

-- Enable RLS
ALTER TABLE public.user_social_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: users can manage their own social profiles
CREATE POLICY user_social_profiles_policy ON public.user_social_profiles
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MARKET INTELLIGENCE table
CREATE TABLE IF NOT EXISTS public.market_intelligence (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  trend_data jsonb not null,
  confidence_score numeric(3,2) check (confidence_score >= 0 and confidence_score <= 1),
  source text,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS market_intelligence_category_idx ON public.market_intelligence (category);
CREATE INDEX IF NOT EXISTS market_intelligence_created_at_idx ON public.market_intelligence (created_at);

-- Enable RLS
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;

-- RLS: public read access
CREATE POLICY market_intelligence_view_policy ON public.market_intelligence
  FOR SELECT USING (true);

-- TREND ANALYSES table
CREATE TABLE IF NOT EXISTS public.trend_analyses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  trend_name text not null,
  description text,
  growth_rate numeric(5,2),
  popularity_score numeric(3,2) check (popularity_score >= 0 and popularity_score <= 1),
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS trend_analyses_category_idx ON public.trend_analyses (category);
CREATE INDEX IF NOT EXISTS trend_analyses_created_at_idx ON public.trend_analyses (created_at);

-- Enable RLS
ALTER TABLE public.trend_analyses ENABLE ROW LEVEL SECURITY;

-- RLS: public read access
CREATE POLICY trend_analyses_view_policy ON public.trend_analyses
  FOR SELECT USING (true);

-- SALES ANALYTICS table
CREATE TABLE IF NOT EXISTS public.sales_analytics (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  quantity int not null,
  revenue numeric(10,2) not null,
  date date not null,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS sales_analytics_product_id_idx ON public.sales_analytics (product_id);
CREATE INDEX IF NOT EXISTS sales_analytics_date_idx ON public.sales_analytics (date);

-- Enable RLS
ALTER TABLE public.sales_analytics ENABLE ROW LEVEL SECURITY;

-- RLS: sellers can view their own product analytics
CREATE POLICY sales_analytics_policy ON public.sales_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products i 
      WHERE i.id = sales_analytics.product_id 
      AND i.seller_id = auth.uid()
    )
  );

-- INVENTORY ANALYTICS table
CREATE TABLE IF NOT EXISTS public.inventory_analytics (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  stock_level int not null,
  reorder_point int not null,
  turnover_rate numeric(5,2),
  date date not null,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS inventory_analytics_product_id_idx ON public.inventory_analytics (product_id);
CREATE INDEX IF NOT EXISTS inventory_analytics_date_idx ON public.inventory_analytics (date);

-- Enable RLS
ALTER TABLE public.inventory_analytics ENABLE ROW LEVEL SECURITY;

-- RLS: sellers can view their own inventory analytics
CREATE POLICY inventory_analytics_policy ON public.inventory_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products i 
      WHERE i.id = inventory_analytics.product_id 
      AND i.seller_id = auth.uid()
    )
  );

-- PRICE OPTIMIZATIONS table
CREATE TABLE IF NOT EXISTS public.price_optimizations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  current_price numeric(10,2) not null,
  suggested_price numeric(10,2) not null,
  confidence_score numeric(3,2) check (confidence_score >= 0 and confidence_score <= 1),
  reasoning text,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS price_optimizations_product_id_idx ON public.price_optimizations (product_id);

-- Enable RLS
ALTER TABLE public.price_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS: sellers can view their own price optimizations
CREATE POLICY price_optimizations_policy ON public.price_optimizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products i 
      WHERE i.id = price_optimizations.product_id 
      AND i.seller_id = auth.uid()
    )
  );

-- Add missing columns to existing tables

-- Add missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS condition text,
ADD COLUMN IF NOT EXISTS style text,
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS color text;

-- Add missing columns to profiles table for personalization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS style_preferences jsonb default '{}'::jsonb,
ADD COLUMN IF NOT EXISTS size_preferences jsonb default '{}'::jsonb,
ADD COLUMN IF NOT EXISTS price_range jsonb default '{}'::jsonb,
ADD COLUMN IF NOT EXISTS favorite_categories text[],
ADD COLUMN IF NOT EXISTS body_measurements jsonb default '{}'::jsonb;
