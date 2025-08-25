-- Hyper-Personalized Shopping Experience Migration (Test)
-- Creates tables and functions for ultra-personalized user experiences

-- Test table creation
CREATE TABLE IF NOT EXISTS public.test_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, preference_type, preference_key)
);

-- Test index creation
CREATE INDEX IF NOT EXISTS idx_test_user_preferences_user_id ON public.test_user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_test_user_preferences_type_key ON public.test_user_preferences(preference_type, preference_key);

-- Enable RLS
ALTER TABLE public.test_user_preferences ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy
CREATE POLICY "Users can manage their own preferences" ON public.test_user_preferences
FOR ALL USING (auth.uid() = user_id);
