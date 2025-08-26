-- Manual Migration Script for StreetStashed App
-- Run this in your Supabase SQL Editor to create all missing tables
-- 1. User Style Profiles (for AI Stylist)
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
-- 2. Personalization Events
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
-- 3. Personalized Recommendations
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
-- 4. Style Moods
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
-- 5. Personalization Insights
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
-- 6. User Preferences
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
-- 7. User Measurements (for AR Try-On)
CREATE TABLE IF NOT EXISTS user_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    height DECIMAL(5, 2),
    weight DECIMAL(5, 2),
    chest DECIMAL(5, 2),
    waist DECIMAL(5, 2),
    hips DECIMAL(5, 2),
    shoulders DECIMAL(5, 2),
    inseam DECIMAL(5, 2),
    body_type TEXT CHECK (
        body_type IN ('athletic', 'slim', 'regular', 'plus')
    ),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 8. Shopping Cart
CREATE TABLE IF NOT EXISTS shopping_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, item_id)
);
-- 9. Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, item_id)
);
-- 10. Order History
CREATE TABLE IF NOT EXISTS order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN (
            'pending',
            'confirmed',
            'shipped',
            'delivered',
            'cancelled',
            'returned'
        )
    ),
    total_amount DECIMAL(10, 2) NOT NULL,
    items JSONB NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 11. User Reviews
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review_text TEXT,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, item_id)
);
-- 12. Social Interactions
CREATE TABLE IF NOT EXISTS social_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (
        interaction_type IN ('follow', 'like', 'comment', 'share')
    ),
    target_type TEXT NOT NULL CHECK (
        target_type IN ('profile', 'post', 'item', 'outfit')
    ),
    target_id UUID,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 13. Referral System
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_email TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'expired')),
    reward_amount DECIMAL(10, 2) DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 14. Rewards and Points
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    level TEXT NOT NULL DEFAULT 'bronze' CHECK (
        level IN (
            'bronze',
            'silver',
            'gold',
            'platinum',
            'diamond'
        )
    ),
    last_activity TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 15. Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    order_updates BOOLEAN DEFAULT true,
    new_items BOOLEAN DEFAULT true,
    promotions BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Create indexes for performance
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
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_user_id ON user_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_order_history_user_id ON order_history(user_id);
CREATE INDEX IF NOT EXISTS idx_order_history_status ON order_history(status);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_item_id ON user_reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_user_id ON social_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
-- Enable Row Level Security
ALTER TABLE user_style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
-- Create RLS policies for all tables
-- User Style Profiles
CREATE POLICY "Users can manage their own style profile" ON user_style_profiles FOR ALL USING (auth.uid() = user_id);
-- Personalization Events
CREATE POLICY "Users can view and insert their own events" ON personalization_events FOR ALL USING (auth.uid() = user_id);
-- Personalized Recommendations
CREATE POLICY "Users can view and insert their own recommendations" ON personalized_recommendations FOR ALL USING (auth.uid() = user_id);
-- Style Moods
CREATE POLICY "Users can view and insert their own moods" ON style_moods FOR ALL USING (auth.uid() = user_id);
-- Personalization Insights
CREATE POLICY "Users can view and insert their own insights" ON personalization_insights FOR ALL USING (auth.uid() = user_id);
-- User Preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
-- User Measurements
CREATE POLICY "Users can manage their own measurements" ON user_measurements FOR ALL USING (auth.uid() = user_id);
-- Shopping Cart
CREATE POLICY "Users can manage their own cart" ON shopping_cart FOR ALL USING (auth.uid() = user_id);
-- Wishlist
CREATE POLICY "Users can manage their own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);
-- Order History
CREATE POLICY "Users can view their own orders" ON order_history FOR ALL USING (auth.uid() = user_id);
-- User Reviews
CREATE POLICY "Users can manage their own reviews" ON user_reviews FOR ALL USING (auth.uid() = user_id);
-- Social Interactions
CREATE POLICY "Users can manage their own interactions" ON social_interactions FOR ALL USING (auth.uid() = user_id);
-- Referrals
CREATE POLICY "Users can view their own referrals" ON referrals FOR ALL USING (auth.uid() = user_id);
-- User Rewards
CREATE POLICY "Users can view their own rewards" ON user_rewards FOR ALL USING (auth.uid() = user_id);
-- Notification Preferences
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);
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
GRANT SELECT,
    INSERT,
    UPDATE ON user_measurements TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON shopping_cart TO authenticated;
GRANT SELECT,
    INSERT,
    DELETE ON wishlist TO authenticated;
GRANT SELECT ON order_history TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE ON user_reviews TO authenticated;
GRANT SELECT,
    INSERT ON social_interactions TO authenticated;
GRANT SELECT ON referrals TO authenticated;
GRANT SELECT ON user_rewards TO authenticated;
GRANT SELECT,
    UPDATE ON notification_preferences TO authenticated;
-- Create function to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create triggers for updated_at columns
CREATE TRIGGER update_user_style_profiles_updated_at BEFORE
UPDATE ON user_style_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE
UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_measurements_updated_at BEFORE
UPDATE ON user_measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_history_updated_at BEFORE
UPDATE ON order_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_rewards_updated_at BEFORE
UPDATE ON user_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE
UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Success message
SELECT 'Migration completed successfully! All tables created with proper permissions and RLS policies.' as status;