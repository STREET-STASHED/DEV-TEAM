#!/bin/bash

# 🚀 StreetStashed Production Setup Script
# This script helps you configure all production settings

set -e

echo "🌟 Setting up StreetStashed for production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found. Install it first:"
        echo "npm install -g supabase"
        exit 1
    fi
    
    if ! command -v stripe &> /dev/null; then
        print_warning "Stripe CLI not found. Install it for webhook testing:"
        echo "brew install stripe/stripe-cli/stripe"
    fi
    
    print_success "Dependencies check complete"
}

# Create environment file
create_env_file() {
    print_status "Creating .env.local file..."
    
    if [ -f .env.local ]; then
        print_warning ".env.local already exists. Backing up..."
        cp .env.local .env.local.backup
    fi
    
    cat > .env.local << 'EOF'
# 🌍 StreetStashed Production Environment Variables
# Replace all placeholder values with your actual API keys

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key-here
STRIPE_SECRET_KEY=sk_live_your-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYour-Google-Maps-API-Key-Here

# Application Configuration
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Feature Flags
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_GOOGLE_MAPS=true
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false
EOF

    print_success ".env.local file created"
    print_warning "⚠️  IMPORTANT: Edit .env.local and replace placeholder values with your real API keys!"
}

# Setup Stripe webhooks
setup_stripe_webhooks() {
    print_status "Setting up Stripe webhooks..."
    
    if command -v stripe &> /dev/null; then
        print_status "Stripe CLI found. Setting up webhooks..."
        
        # Get the webhook endpoint URL
        read -p "Enter your production webhook endpoint URL (e.g., https://your-domain.com/api/stripe/webhook): " WEBHOOK_URL
        
        if [ -n "$WEBHOOK_URL" ]; then
            print_status "Creating Stripe webhook..."
            stripe webhooks create --url="$WEBHOOK_URL" --events=payment_intent.succeeded,payment_intent.payment_failed,charge.succeeded,charge.failed
            
            print_success "Stripe webhook created"
            print_warning "Copy the webhook secret (whsec_...) to your .env.local file"
        else
            print_warning "Skipping Stripe webhook setup"
        fi
    else
        print_warning "Stripe CLI not found. Set up webhooks manually:"
        echo "1. Go to https://dashboard.stripe.com/webhooks"
        echo "2. Click 'Add endpoint'"
        echo "3. Enter your webhook URL: https://your-domain.com/api/stripe/webhook"
        echo "4. Select events: payment_intent.succeeded, payment_intent.payment_failed, charge.succeeded, charge.failed"
        echo "5. Copy the webhook secret to .env.local"
    fi
}

# Setup Google Maps billing
setup_google_maps() {
    print_status "Setting up Google Maps billing..."
    
    print_warning "To enable Google Maps billing:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Select your project"
    echo "3. Go to Billing → Link a billing account"
    echo "4. Enable Maps JavaScript API, Geocoding API, and Places API"
    echo "5. Set up billing alerts and quotas"
    echo "6. Copy your API key to .env.local"
}

# Setup monitoring and analytics
setup_monitoring() {
    print_status "Setting up monitoring and analytics..."
    
    print_warning "Recommended monitoring setup:"
    echo "1. Vercel Analytics (if using Vercel)"
    echo "2. Sentry for error tracking"
    echo "3. Google Analytics 4"
    echo "4. LogRocket for session replay"
    echo "5. Uptime monitoring (UptimeRobot, Pingdom)"
}

# Deploy to hosting platform
deploy_to_hosting() {
    print_status "Deployment options..."
    
    echo "Choose your hosting platform:"
    echo "1. Vercel (Recommended for Next.js)"
    echo "2. Netlify"
    echo "3. AWS Amplify"
    echo "4. DigitalOcean App Platform"
    echo "5. Custom server"
    
    read -p "Enter your choice (1-5): " DEPLOY_CHOICE
    
    case $DEPLOY_CHOICE in
        1)
            print_status "Setting up Vercel deployment..."
            echo "1. Install Vercel CLI: npm i -g vercel"
            echo "2. Run: vercel --prod"
            echo "3. Set environment variables in Vercel dashboard"
            ;;
        2)
            print_status "Setting up Netlify deployment..."
            echo "1. Connect your GitHub repo to Netlify"
            echo "2. Set build command: npm run build"
            echo "3. Set publish directory: .next"
            echo "4. Set environment variables in Netlify dashboard"
            ;;
        3)
            print_status "Setting up AWS Amplify deployment..."
            echo "1. Connect your GitHub repo to AWS Amplify"
            echo "2. Set build settings in amplify.yml"
            echo "3. Set environment variables in Amplify console"
            ;;
        4)
            print_status "Setting up DigitalOcean App Platform..."
            echo "1. Connect your GitHub repo to DigitalOcean"
            echo "2. Set build command: npm run build"
            echo "3. Set environment variables in app spec"
            ;;
        5)
            print_status "Custom server deployment..."
            echo "1. Build the app: npm run build"
            echo "2. Copy .next folder to your server"
            echo "3. Set up PM2 or similar process manager"
            echo "4. Configure nginx/apache reverse proxy"
            ;;
        *)
            print_warning "Invalid choice. Set up deployment manually."
            ;;
    esac
}

# Generate production build
build_production() {
    print_status "Building production version..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Build the app
    print_status "Building the app..."
    npm run build
    
    # Type check
    print_status "Running type check..."
    npm run type-check || true
    
    # Lint check
    print_status "Running lint check..."
    npm run lint || true
    
    print_success "Production build complete!"
}

# Main execution
main() {
    echo "🚀 StreetStashed Production Setup"
    echo "================================"
    
    check_dependencies
    create_env_file
    setup_stripe_webhooks
    setup_google_maps
    setup_monitoring
    deploy_to_hosting
    build_production
    
    echo ""
    echo "🎉 Setup complete! Next steps:"
    echo "1. Edit .env.local with your real API keys"
    echo "2. Test the app locally: npm run dev"
    echo "3. Deploy to your chosen platform"
    echo "4. Set up monitoring and analytics"
    echo "5. Test all features in production"
    echo ""
    echo "📚 Documentation: ENVIRONMENT_SETUP.md"
    echo "🧪 Test page: /test-integration"
}

# Run the script
main "$@"
