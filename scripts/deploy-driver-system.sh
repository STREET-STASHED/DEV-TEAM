#!/bin/bash

# StreetStashed Driver System Deployment Script
# This script will deploy the complete driver system to your Supabase database

echo "🚀 StreetStashed Driver System Deployment"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "supabase/deploy-driver-system.sql" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase CLI found and logged in"
echo ""

# Deploy the driver system
echo "📦 Deploying driver system to Supabase..."
echo ""

# Option 1: Use Supabase CLI (if linked to project)
if supabase projects list &> /dev/null; then
    echo "🔗 Supabase project linked, using CLI deployment..."
    
    # Get the SQL content
    SQL_CONTENT=$(cat supabase/deploy-driver-system.sql)
    
    # Deploy using Supabase CLI
    echo "$SQL_CONTENT" | supabase db push
    
    if [ $? -eq 0 ]; then
        echo "✅ Driver system deployed successfully via CLI!"
    else
        echo "⚠️  CLI deployment failed, trying manual method..."
        MANUAL_DEPLOY=true
    fi
else
    echo "⚠️  No Supabase project linked, using manual deployment..."
    MANUAL_DEPLOY=true
fi

# Option 2: Manual deployment instructions
if [ "$MANUAL_DEPLOY" = true ]; then
    echo ""
    echo "📋 Manual Deployment Required:"
    echo "==============================="
    echo ""
    echo "1. Go to your Supabase Dashboard:"
    echo "   https://supabase.com/dashboard"
    echo ""
    echo "2. Select your project"
    echo ""
    echo "3. Go to SQL Editor (left sidebar)"
    echo ""
    echo "4. Copy and paste the contents of:"
    echo "   supabase/deploy-driver-system.sql"
    echo ""
    echo "5. Click 'Run' to execute the script"
    echo ""
    echo "6. Wait for all tables and functions to be created"
    echo ""
fi

echo ""
echo "🔐 Next Steps:"
echo "=============="
echo ""

# Generate a secure CRON_SECRET
echo "1. Generate a secure CRON_SECRET:"
echo "   openssl rand -base64 32"
echo "   or visit: https://generate-secret.vercel.app/32"
echo ""

# Add to environment
echo "2. Add to your .env.local:"
echo "   CRON_SECRET=your-generated-secret-here"
echo ""

# Set up cron job
echo "3. Set up the cron job using one of these options:"
echo "   - Vercel Cron (add to vercel.json)"
echo "   - GitHub Actions (.github/workflows/cron-assign-orders.yml)"
echo "   - External service (cron-job.org)"
echo "   - See docs/CRON_JOB_SETUP.md for details"
echo ""

# Test the system
echo "4. Test the system:"
echo "   - Create a test order"
echo "   - Go online as a driver"
echo "   - Trigger the cron job manually"
echo ""

# Check deployment
echo "5. Verify deployment:"
echo "   - Check if tables were created in Supabase"
echo "   - Verify RLS policies are active"
echo "   - Test the API endpoints"
echo ""

echo "📚 Documentation:"
echo "================="
echo "   - Cron Job Setup: docs/CRON_JOB_SETUP.md"
echo "   - API Endpoints: app/api/orders/assign-driver/route.ts"
echo "   - Auto Assignment: app/api/cron/auto-assign-orders/route.ts"
echo ""

echo "🎉 Your driver system is ready to be deployed!"
echo ""
echo "Need help? Check the documentation or test the endpoints manually."
echo ""

# Check if we can test the API
if [ -f ".env.local" ]; then
    echo "🔍 Testing API endpoints..."
    
    # Check if the app is running
    if curl -s "http://localhost:3000" &> /dev/null; then
        echo "✅ App is running on localhost:3000"
        echo "   Test endpoint: http://localhost:3000/api/cron/auto-assign-orders"
    else
        echo "⚠️  App not running. Start it with: pnpm dev"
    fi
else
    echo "⚠️  .env.local not found. Create it with your environment variables."
fi

echo ""
echo "�� Happy deploying!"
