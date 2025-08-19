#!/bin/bash

# 🚀 StreetStashed App Store Launch Script
# This script automates the build and preparation process for app store submission

set -e

echo "🎯 StreetStashed App Store Launch Script"
echo "========================================"

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
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not available. Please check your Node.js installation."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Build the Next.js application
build_app() {
    print_status "Building Next.js application..."
    
    if pnpm build; then
        print_success "Build completed successfully!"
    else
        print_error "Build failed! Please check the errors above."
        exit 1
    fi
}

# Sync Capacitor project
sync_capacitor() {
    print_status "Syncing Capacitor project..."
    
    if npx cap sync; then
        print_success "Capacitor sync completed!"
    else
        print_error "Capacitor sync failed! Please check the errors above."
        exit 1
    fi
}

# Generate app icons and assets
generate_assets() {
    print_status "Generating app assets..."
    
    if node scripts/generate-icons.js; then
        print_success "App assets generated!"
    else
        print_warning "Asset generation had issues. Please check manually."
    fi
}

# Open development environments
open_dev_environments() {
    print_status "Opening development environments..."
    
    echo ""
    echo "🎯 Next Steps:"
    echo "=============="
    echo ""
    echo "1. 📱 iOS Development:"
    echo "   - Run: npx cap open ios"
    echo "   - Open ios/App.xcworkspace in Xcode"
    echo "   - Configure signing & capabilities"
    echo "   - Build & archive for App Store"
    echo ""
    echo "2. 🤖 Android Development:"
    echo "   - Run: npx cap open android"
    echo "   - Open android/ folder in Android Studio"
    echo "   - Configure signing keys"
    echo "   - Build AAB for Play Store"
    echo ""
    echo "3. 🌐 PWA Deployment:"
    echo "   - Deploy to your hosting provider"
    echo "   - Test PWA installation"
    echo ""
    echo "4. 📋 App Store Setup:"
    echo "   - Create Apple Developer account ($99/year)"
    echo "   - Create Google Play Console account ($25)"
    echo "   - Prepare app store listings"
    echo "   - Submit for review"
    echo ""
}

# Main execution
main() {
    echo ""
    print_status "Starting StreetStashed app store launch process..."
    echo ""
    
    check_requirements
    build_app
    sync_capacitor
    generate_assets
    
    echo ""
    print_success "🎉 App store preparation completed!"
    echo ""
    
    open_dev_environments
    
    echo ""
    print_status "🚀 Ready to launch! Follow the steps above to submit to app stores."
    echo ""
    print_status "📚 For detailed instructions, see: docs/APP_STORE_LAUNCH_GUIDE.md"
    echo ""
}

# Run main function
main "$@"
