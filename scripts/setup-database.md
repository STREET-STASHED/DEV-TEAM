# Database Setup Instructions

## Step 1: Run the Migration in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/ofccxjxowebslrcuynrw
2. Navigate to the **SQL Editor** tab
3. Copy the contents of `supabase/migrations/20250101000000_create_missing_tables.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the migration

## Step 2: Verify Tables Were Created

After running the migration, you should see these tables in your **Table Editor**:
- `wishlist`
- `user_style_profiles`
- `audit_log`
- `orders`
- `profiles`
- `disputes`
- `referrals`
- `user_rewards`
- `user_measurements`
- `social_challenges`
- `personalization_events`
- `monitoring_metrics`

## Step 3: Regenerate TypeScript Types

Once the tables are created, regenerate the types:

```bash
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

## Step 4: Test the Application

After setting up the database, test if the app builds:

```bash
pnpm type-check
pnpm build
```

## Alternative: Use Supabase CLI (if login works)

If you can get the Supabase CLI working:

```bash
# Link to your project
npx supabase link --project-ref ofccxjxowebslrcuynrw

# Push the migration
npx supabase db push

# Generate types
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

## Troubleshooting

If you encounter issues:
1. Check that all tables were created successfully
2. Verify the table names match exactly (case-sensitive)
3. Ensure Row Level Security (RLS) is enabled
4. Check that the auth.users table exists and is properly configured
