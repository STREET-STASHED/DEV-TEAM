#!/bin/bash

# 🚀 StreetStashed HTTPS Setup Script for Local Development
# This script generates local SSL certificates for HTTPS development

set -e

echo "🔒 Setting up HTTPS for local development..."

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

# Check if mkcert is installed
check_mkcert() {
    if ! command -v mkcert &> /dev/null; then
        print_error "mkcert not found. Please install it first:"
        echo ""
        echo "On macOS:"
        echo "  brew install mkcert"
        echo "  mkcert -install"
        echo ""
        echo "On Ubuntu/Debian:"
        echo "  sudo apt install mkcert"
        echo "  mkcert -install"
        echo ""
        echo "On Windows:"
        echo "  choco install mkcert"
        echo "  mkcert -install"
        echo ""
        exit 1
    fi
    print_success "mkcert is installed"
}

# Generate SSL certificates
generate_certificates() {
    print_status "Generating SSL certificates for localhost..."
    
    # Install mkcert root CA
    mkcert -install
    
    # Generate certificates for localhost
    mkcert localhost 127.0.0.1 ::1
    
    # Rename certificates to match Next.js config
    mv localhost+2.pem localhost.pem
    mv localhost+2-key.pem localhost-key.pem
    
    print_success "SSL certificates generated successfully"
    print_status "Certificates saved as:"
    echo "  - localhost.pem (certificate)"
    echo "  - localhost-key.pem (private key)"
}

# Update package.json scripts
update_package_scripts() {
    print_status "Updating package.json scripts for HTTPS..."
    
    # Check if HTTPS script already exists
    if grep -q '"dev:https"' package.json; then
        print_warning "HTTPS script already exists in package.json"
        return
    fi
    
    # Add HTTPS development script
    sed -i.bak 's/"dev": "next dev -p 3000"/"dev": "next dev -p 3000",\n    "dev:https": "next dev -p 3000 --experimental-https"/' package.json
    
    print_success "Package.json updated with HTTPS script"
    print_status "You can now run: pnpm dev:https"
}

# Main execution
main() {
    print_status "Starting HTTPS setup..."
    
    check_mkcert
    generate_certificates
    update_package_scripts
    
    echo ""
    print_success "HTTPS setup complete!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Run: pnpm dev:https"
    echo "2. Access your app at: https://localhost:3000"
    echo "3. Accept the security warning in your browser"
    echo ""
    echo "⚠️  Note: You can now use live Stripe keys with HTTPS"
    echo ""
}

# Run main function
main
