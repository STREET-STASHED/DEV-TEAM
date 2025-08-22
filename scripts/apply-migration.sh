#!/bin/bash

# Script to apply the hyper-personalization migration to remote Supabase database

echo "Applying hyper-personalization migration to remote database..."

# Get the project reference from environment
PROJECT_REF="ofccxjxowebslrcuynrw"

# Check if we have the necessary environment variables
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    echo "Please set it in your .env.local file"
    exit 1
fi

# Apply the migration using psql connection
echo "Connecting to remote database and applying migration..."

# Create a temporary connection string
CONNECTION_STRING="postgresql://postgres.${PROJECT_REF}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-${PROJECT_REF}.pooler.supabase.com:6543/postgres"

# Apply the migration
psql "$CONNECTION_STRING" -f scripts/apply-hyper-personalization.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo "The user_style_profiles table and related structures have been created."
else
    echo "❌ Failed to apply migration"
    echo "Please check the error messages above and try again."
    exit 1
fi

echo "Migration complete!"
