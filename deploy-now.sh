#!/bin/bash

# 🚀 StreetStashed Quick Deploy Script
# Deploy to production in minutes!

set -e

echo "🚀 StreetStashed Quick Deploy"
echo "============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_error ".env.local not found! Run setup-production.sh first."
    exit 1
fi

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Install Node.js first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git not found. Install Git first."
        exit 1
    fi
    
    print_success "Dependencies check complete"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Build
    print_status "Building for production..."
    npm run build
    
    print_success "Build complete!"
}

# Deploy to Vercel (recommended)
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_status "Deploying to production..."
    vercel --prod --yes
    
    print_success "Deployed to Vercel!"
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    print_status "Deploying to Netlify..."
    netlify deploy --prod --dir=.next
    
    print_success "Deployed to Netlify!"
}

# Deploy to Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Install Docker first."
        exit 1
    fi
    
    print_status "Building Docker image..."
    docker build -t streetstashed .
    
    print_status "Starting containers..."
    docker-compose up -d
    
    print_success "Deployed with Docker!"
}

# Main deployment flow
main() {
    check_dependencies
    build_app
    
    echo ""
    echo "Choose deployment method:"
    echo "1. Vercel (Recommended - Next.js optimized)"
    echo "2. Netlify"
    echo "3. Docker (Custom server)"
    echo "4. Manual deployment"
    
    read -p "Enter your choice (1-4): " DEPLOY_CHOICE
    
    case $DEPLOY_CHOICE in
        1)
            deploy_vercel
            ;;
        2)
            deploy_netlify
            ;;
        3)
            deploy_docker
            ;;
        4)
            print_status "Manual deployment selected."
            print_warning "Follow the DEPLOYMENT_GUIDE.md for manual steps."
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "1. Test your deployed app"
    echo "2. Verify all features work"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure custom domain (optional)"
    echo ""
    echo "📚 Documentation: DEPLOYMENT_GUIDE.md"
    echo "🧪 Test page: /test-integration"
}

# Run the script
main "$@"
