-- Apply Hyper-Personalization Migration
-- This script creates the missing user_style_profiles table and related structures
-- User style profiles
CREATE TABLE IF NOT EXISTS user_style_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    style_preferences JSONB NOT NULL DEFAULT '{}',
    body_profile JSONB NOT NULL DEFAULT '{}',
    behavior_profile JSONB NOT NULL DEFAULT '{}',
    context_profile JSONB NOT NULL DEFAULT '{}',
    ai_profile JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Personalization events tracking
CREATE TABLE IF NOT EXISTS personalization_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'view',
            'like',
            'share',
            'purchase',
            'return',
            'search',
            'filter',
            'cart_add',
            'cart_remove',
            'wishlist_add'
        )
    ),
    item_id UUID REFERENCES items(id) ON DELETE
    SET NULL,
        category TEXT,
        price DECIMAL(10, 2),
        context JSONB NOT NULL DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT now()
);
-- Personalized recommendations
CREATE TABLE IF NOT EXISTS personalized_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    score DECIMAL(5, 4) NOT NULL CHECK (
        score >= 0
        AND score <= 1
    ),
    reason TEXT NOT NULL,
    category TEXT NOT NULL,
    personalization_factors JSONB NOT NULL DEFAULT '{}',
    context JSONB NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Style moods and emotional states
CREATE TABLE IF NOT EXISTS style_moods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL CHECK (
        mood IN (
            'confident',
            'casual',
            'professional',
            'creative',
            'comfortable',
            'bold'
        )
    ),
    intensity DECIMAL(3, 2) NOT NULL CHECK (
        intensity >= 0
        AND intensity <= 1
    ),
    triggers TEXT [] DEFAULT '{}',
    preferences JSONB NOT NULL DEFAULT '{}',
    duration_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Personalization insights
CREATE TABLE IF NOT EXISTS personalization_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (
        insight_type IN (
            'style_evolution',
            'price_sensitivity',
            'brand_loyalty',
            'seasonal_pattern',
            'social_influence',
            'context_preference'
        )
    ),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3, 2) NOT NULL CHECK (
        confidence >= 0
        AND confidence <= 1
    ),
    actionable BOOLEAN DEFAULT false,
    action TEXT,
    impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
    created_at TIMESTAMPTZ DEFAULT now()
);
-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL,
    preference_key TEXT NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, preference_type, preference_key)
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_style_profiles_user_id ON user_style_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_personalization_events_user_id ON personalization_events(user_id);
CREATE INDEX IF NOT EXISTS idx_personalization_events_type ON personalization_events(event_type);
CREATE INDEX IF NOT EXISTS idx_personalization_events_created_at ON personalization_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_user_id ON personalized_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_score ON personalized_recommendations(score DESC);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_expires_at ON personalized_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_style_moods_user_id ON style_moods(user_id);
CREATE INDEX IF NOT EXISTS idx_style_moods_created_at ON style_moods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personalization_insights_user_id ON personalization_insights(user_id);
-- Enable Row Level Security
ALTER TABLE user_style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- RLS Policies for user_style_profiles
CREATE POLICY "Users can view their own style profile" ON user_style_profiles FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own style profile" ON user_style_profiles FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own style profile" ON user_style_profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- RLS Policies for personalization_events
CREATE POLICY "Users can view their own events" ON personalization_events FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON personalization_events FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- RLS Policies for personalized_recommendations
CREATE POLICY "Users can view their own recommendations" ON personalized_recommendations FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recommendations" ON personalized_recommendations FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- RLS Policies for style_moods
CREATE POLICY "Users can view their own moods" ON style_moods FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own moods" ON style_moods FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- RLS Policies for personalization_insights
CREATE POLICY "Users can view their own insights" ON personalization_insights FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own insights" ON personalization_insights FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Grant permissions to authenticated users
GRANT SELECT,
    INSERT,
    UPDATE ON user_style_profiles TO authenticated;
GRANT SELECT,
    INSERT ON personalization_events TO authenticated;
GRANT SELECT,
    INSERT ON personalized_recommendations TO authenticated;
GRANT SELECT,
    INSERT ON style_moods TO authenticated;
GRANT SELECT,
    INSERT ON personalization_insights TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE ON user_preferences TO authenticated;
-- Create default style profile for existing users
INSERT INTO user_style_profiles (
        user_id,
        style_preferences,
        body_profile,
        behavior_profile,
        context_profile,
        ai_profile
    )
SELECT id,
    '{"preferences": ["streetwear", "minimalist", "comfortable"], "favoriteColors": ["black", "white", "navy"], "styleType": "urban", "budget": "mid-range", "occasions": ["casual", "work", "going-out"]}'::jsonb,
    '{"height": "average", "build": "average", "age": "young-adult", "gender": "unisex"}'::jsonb,
    '{"shoppingFrequency": "monthly", "brandLoyalty": "moderate", "trendFollowing": "moderate", "sustainability": "moderate"}'::jsonb,
    '{"location": {"city": "Unknown", "state": "Unknown", "country": "Unknown", "climate": "temperate", "timezone": "UTC"}, "lifestyle": {"occupation": "Unknown", "activityLevel": "moderate", "hobbies": [], "socialCircle": "ambivert", "lifeStage": "young-professional"}, "values": {"sustainability": 0.5, "ethicalProduction": 0.5, "localBusiness": 0.5, "exclusivity": 0.5, "affordability": 0.5}}'::jsonb,
    '{"learningRate": 0.1, "confidenceScore": 0.3, "dataPoints": 0, "accuracyScore": 0.5}'::jsonb
FROM auth.users
WHERE id NOT IN (
        SELECT user_id
        FROM user_style_profiles
    );
-- Update the updated_at column trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create triggers for updated_at
CREATE TRIGGER update_user_style_profiles_updated_at BEFORE
UPDATE ON user_style_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE
UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();