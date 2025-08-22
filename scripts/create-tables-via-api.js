#!/usr/bin/env node

/**
 * Script to create missing database tables via Supabase REST API
 * This is an alternative to the CLI approach when migrations fail
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('🚀 Starting database table creation...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      process.exit(1);
    }
    console.log('✅ Database connection successful\n');

    // Create user_style_profiles table
    console.log('📋 Creating user_style_profiles table...');
    const { error: styleProfileError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (styleProfileError) {
      console.log('⚠️  user_style_profiles table might already exist or creation failed');
      console.log('   Error:', styleProfileError.message);
    } else {
      console.log('✅ user_style_profiles table created successfully');
    }

    // Create personalization_events table
    console.log('📋 Creating personalization_events table...');
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS personalization_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL CHECK (event_type IN (
            'view', 'like', 'share', 'purchase', 'return', 'search', 
            'filter', 'cart_add', 'cart_remove', 'wishlist_add'
          )),
          item_id UUID REFERENCES items(id) ON DELETE SET NULL,
          category TEXT,
          price DECIMAL(10, 2),
          context JSONB NOT NULL DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `
    });

    if (eventsError) {
      console.log('⚠️  personalization_events table might already exist or creation failed');
      console.log('   Error:', eventsError.message);
    } else {
      console.log('✅ personalization_events table created successfully');
    }

    // Create personalized_recommendations table
    console.log('📋 Creating personalized_recommendations table...');
    const { error: recsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS personalized_recommendations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
          score DECIMAL(5, 4) NOT NULL CHECK (score >= 0 AND score <= 1),
          reason TEXT NOT NULL,
          category TEXT NOT NULL,
          personalization_factors JSONB NOT NULL DEFAULT '{}',
          context JSONB NOT NULL DEFAULT '{}',
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `
    });

    if (recsError) {
      console.log('⚠️  personalized_recommendations table might already exist or creation failed');
      console.log('   Error:', recsError.message);
    } else {
      console.log('✅ personalized_recommendations table created successfully');
    }

    // Create indexes
    console.log('📋 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_style_profiles_user_id ON user_style_profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_personalization_events_user_id ON personalization_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_user_id ON personalized_recommendations(user_id);
      `
    });

    if (indexError) {
      console.log('⚠️  Some indexes might already exist or creation failed');
      console.log('   Error:', indexError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Enable RLS
    console.log('📋 Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_style_profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE personalization_events ENABLE ROW LEVEL SECURITY;
        ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.log('⚠️  RLS might already be enabled or enabling failed');
      console.log('   Error:', rlsError.message);
    } else {
      console.log('✅ Row Level Security enabled successfully');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test the AI Stylist page at http://localhost:3000/ai-stylist');
    console.log('   2. Check the browser console for any remaining errors');
    console.log('   3. Verify that profile data is being saved to the database');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
createTables().catch(console.error);
