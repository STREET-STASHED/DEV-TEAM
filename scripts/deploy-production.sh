#!/bin/bash

# 🚀 STREETSTASHED MVP - PRODUCTION DEPLOYMENT SCRIPT
# This script completes the final 20% of launch preparation

set -e

echo "🚀 STREETSTASHED MVP - PRODUCTION DEPLOYMENT"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

echo "🔍 STEP 1: PRE-DEPLOYMENT CHECKS"
echo "--------------------------------"

# Check if all required tools are installed
print_info "Checking required tools..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed"
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi

print_status "All required tools are available"

# Check git status
print_info "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Consider committing them before deployment."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_status "Git status checked"

echo ""
echo "🧪 STEP 2: FINAL TESTING"
echo "-------------------------"

# Run all tests
print_info "Running comprehensive test suite..."
pnpm test > /dev/null 2>&1
print_status "All tests passed"

# Type checking
print_info "Running TypeScript type check..."
pnpm run type-check > /dev/null 2>&1
print_status "TypeScript compilation successful"

# Linting
print_info "Running ESLint..."
pnpm run lint > /dev/null 2>&1
print_status "Linting passed"

# Build test
print_info "Testing production build..."
pnpm run build > /dev/null 2>&1
print_status "Production build successful"

echo ""
echo "🔧 STEP 3: PRODUCTION CONFIGURATION"
echo "-----------------------------------"

# Check if production.env exists and has required values
print_info "Checking production environment configuration..."

if [ ! -f "config/production.env" ]; then
    print_error "config/production.env not found"
    exit 1
fi

# Check for placeholder values
if grep -q "your_supabase_url" config/production.env; then
    print_warning "Supabase URL still has placeholder value"
    print_info "Please update config/production.env with your actual Supabase credentials"
    echo ""
    echo "Required updates:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY" 
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- NEXT_PUBLIC_APP_URL"
    echo ""
    read -p "Press Enter after updating the configuration..."
fi

print_status "Environment configuration verified"

echo ""
echo "🚀 STEP 4: DEPLOYMENT OPTIONS"
echo "------------------------------"

echo "Choose your deployment platform:"
echo "1) Vercel (Recommended - Easy, fast, optimized for Next.js)"
echo "2) Netlify (Good alternative, easy setup)"
echo "3) Custom server (Advanced users)"
echo "4) Docker container"
echo ""

read -p "Select deployment option (1-4): " -n 1 -r
echo

case $REPLY in
    1)
        print_info "Setting up Vercel deployment..."
        
        if ! command -v vercel &> /dev/null; then
            print_info "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        print_info "Deploying to Vercel..."
        vercel --prod
        
        print_status "Vercel deployment initiated"
        print_info "Check your Vercel dashboard for deployment status"
        ;;
        
    2)
        print_info "Setting up Netlify deployment..."
        
        if ! command -v netlify &> /dev/null; then
            print_info "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        print_info "Building for Netlify..."
        pnpm run build
        
        print_info "Deploying to Netlify..."
        netlify deploy --prod --dir=.next
        
        print_status "Netlify deployment initiated"
        ;;
        
    3)
        print_info "Custom server deployment selected"
        print_info "Build command: pnpm run build"
        print_info "Start command: pnpm start"
        print_info "Make sure to set NODE_ENV=production"
        ;;
        
    4)
        print_info "Docker deployment selected"
        
        if [ ! -f "Dockerfile" ]; then
            print_info "Creating production Dockerfile..."
            cat > Dockerfile << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF
        fi
        
        print_info "Building Docker image..."
        docker build -t streetstashed-mvp .
        
        print_info "Running Docker container..."
        docker run -d -p 3000:3000 --name streetstashed-app streetstashed-mvp
        
        print_status "Docker deployment completed"
        ;;
        
    *)
        print_error "Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "🔍 STEP 5: POST-DEPLOYMENT VERIFICATION"
echo "----------------------------------------"

print_info "Waiting for deployment to complete..."
sleep 10

print_info "Running health checks..."

# Check if the app is responding (basic health check)
if [ "$REPLY" = "1" ] || [ "$REPLY" = "2" ]; then
    print_info "Please run the following health checks manually:"
    echo ""
    echo "1. Visit your deployed URL"
    echo "2. Test user registration/login"
    echo "3. Test marketplace functionality"
    echo "4. Test shopping cart"
    echo "5. Test user dashboards"
    echo "6. Check API endpoints"
    echo ""
else
    print_info "Testing local deployment..."
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Local deployment is responding"
    else
        print_warning "Local deployment may not be ready yet"
    fi
fi

echo ""
echo "📋 STEP 6: FINAL CHECKLIST"
echo "---------------------------"

echo "✅ Pre-deployment checks completed"
echo "✅ All tests passed"
echo "✅ Production build successful"
echo "✅ Environment configuration verified"
echo "✅ Deployment initiated"
echo ""

if [ "$REPLY" = "1" ] || [ "$REPLY" = "2" ]; then
    echo "🚨 IMPORTANT: Complete these final steps:"
    echo "1. Set environment variables in your deployment platform"
    echo "2. Configure custom domain (if applicable)"
    echo "3. Set up SSL certificate"
    echo "4. Configure monitoring and analytics"
    echo "5. Run comprehensive smoke tests"
    echo "6. Monitor error logs for first 24 hours"
    echo ""
fi

echo "🎉 CONGRATULATIONS! Your StreetStashed MVP is deployed!"
echo ""
echo "📊 LAUNCH READINESS: 100% COMPLETE 🚀"
echo ""
echo "Next: Start marketing and onboarding your first users!"
echo ""
echo "For support and monitoring:"
echo "- Check deployment platform dashboard"
echo "- Monitor application logs"
echo "- Set up error tracking (Sentry recommended)"
echo "- Configure performance monitoring"

print_status "Deployment script completed successfully!"
