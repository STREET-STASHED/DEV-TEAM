#!/bin/bash

# 🚀 STREETSTASHED MVP - PRODUCTION SETUP SCRIPT
# This script helps configure your production environment

set -e

echo "🚀 STREETSTASHED MVP - PRODUCTION SETUP"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo "🔧 STEP 1: ENVIRONMENT SETUP"
echo "-----------------------------"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    print_warning ".env.local already exists. Do you want to overwrite it?"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled. Your existing .env.local is preserved."
        exit 0
    fi
fi

# Copy production template
print_info "Setting up production environment file..."
cp config/production-template.env .env.local

print_status "Production environment file created (.env.local)"

echo ""
echo "🔐 STEP 2: SUPABASE CONFIGURATION"
echo "----------------------------------"

print_info "You need to configure your Supabase project."
echo ""
echo "1. Go to https://supabase.com/dashboard"
echo "2. Create a new project or select existing one"
echo "3. Go to Settings > API"
echo "4. Copy the following values:"
echo ""

read -p "Enter your Supabase Project URL: " supabase_url
read -p "Enter your Supabase Anon Key: " supabase_anon_key
read -p "Enter your Supabase Service Role Key: " supabase_service_key

# Update .env.local with Supabase values
sed -i.bak "s|your_supabase_url|$supabase_url|g" .env.local
sed -i.bak "s|your_supabase_anon_key|$supabase_anon_key|g" .env.local
sed -i.bak "s|your_service_role_key_here|$supabase_service_key|g" .env.local

print_status "Supabase configuration updated"

echo ""
echo "🌐 STEP 3: DOMAIN CONFIGURATION"
echo "--------------------------------"

read -p "Enter your production domain (e.g., https://yourdomain.com): " domain_url

# Update domain in .env.local
sed -i.bak "s|https://yourdomain.com|$domain_url|g" .env.local

print_status "Domain configuration updated"

echo ""
echo "💳 STEP 4: PAYMENT PROCESSING (STRIPE)"
echo "---------------------------------------"

print_info "You need to set up Stripe for payment processing."
echo ""
echo "1. Go to https://dashboard.stripe.com"
echo "2. Create an account or sign in"
echo "3. Go to Developers > API keys"
echo "4. Copy your publishable and secret keys"
echo ""

read -p "Enter your Stripe Publishable Key (pk_test_...): " stripe_publishable_key
read -p "Enter your Stripe Secret Key (sk_test_...): " stripe_secret_key

# Update .env.local with Stripe values
sed -i.bak "s|pk_test_your_stripe_publishable_key|$stripe_publishable_key|g" .env.local
sed -i.bak "s|sk_test_your_stripe_secret_key|$stripe_secret_key|g" .env.local

print_status "Stripe configuration updated"

echo ""
echo "📧 STEP 5: EMAIL SERVICE"
echo "-------------------------"

echo "Choose your email service provider:"
echo "1) SendGrid (Recommended)"
echo "2) AWS SES"
echo "3) Skip for now"
echo ""

read -p "Select option (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        print_info "Setting up SendGrid..."
        read -p "Enter your SendGrid API Key: " sendgrid_key
        read -p "Enter your from email (e.g., noreply@yourdomain.com): " from_email
        
        # Update .env.local with SendGrid values
        sed -i.bak "s|SG.your_sendgrid_api_key|$sendgrid_key|g" .env.local
        sed -i.bak "s|noreply@yourdomain.com|$from_email|g" .env.local
        
        print_status "SendGrid configuration updated"
        ;;
    2)
        print_info "Setting up AWS SES..."
        read -p "Enter your AWS Access Key ID: " aws_access_key
        read -p "Enter your AWS Secret Access Key: " aws_secret_key
        read -p "Enter your AWS Region (e.g., us-east-1): " aws_region
        
        # Update .env.local with AWS values
        sed -i.bak "s|your_aws_access_key|$aws_access_key|g" .env.local
        sed -i.bak "s|your_aws_secret_key|$aws_secret_key|g" .env.local
        sed -i.bak "s|us-east-1|$aws_region|g" .env.local
        
        print_status "AWS SES configuration updated"
        ;;
    3)
        print_warning "Email service configuration skipped. You can configure it later."
        ;;
    *)
        print_error "Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "🔍 STEP 6: FINAL VERIFICATION"
echo "------------------------------"

print_info "Verifying configuration..."

# Check if critical values are set
if grep -q "your_supabase_url\|your_supabase_anon_key\|your_service_role_key_here" .env.local; then
    print_error "Some Supabase values are still placeholders"
    echo "Please manually update .env.local with correct values"
else
    print_status "Supabase configuration verified"
fi

if grep -q "pk_test_your_stripe_publishable_key\|sk_test_your_stripe_secret_key" .env.local; then
    print_error "Some Stripe values are still placeholders"
    echo "Please manually update .env.local with correct values"
else
    print_status "Stripe configuration verified"
fi

if grep -q "https://yourdomain.com" .env.local; then
    print_error "Domain is still placeholder"
    echo "Please manually update .env.local with correct domain"
else
    print_status "Domain configuration verified"
fi

echo ""
echo "📋 STEP 7: NEXT STEPS"
echo "----------------------"

print_status "Production environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Review and update .env.local with any remaining values"
echo "2. Test your configuration locally"
echo "3. Run the deployment script: ./scripts/deploy-production.sh"
echo "4. Deploy to your chosen platform"
echo "5. Run smoke tests"
echo "6. Go live! 🚀"
echo ""

print_info "Your .env.local file is ready for deployment!"
print_info "Run: ./scripts/deploy-production.sh to continue"

# Clean up backup files
rm -f .env.local.bak

print_status "Setup script completed successfully!"
