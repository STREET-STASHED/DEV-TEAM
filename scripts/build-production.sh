#!/bin/bash

# StreetStashed Production Build Script
# This script handles the complete production build process

set -e  # Exit on any error

echo "🚀 Starting StreetStashed Production Build..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
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
    
    print_success "All dependencies are available"
}

# Clean previous builds
clean_build() {
    print_status "Cleaning previous builds..."
    
    rm -rf .next
    rm -rf out
    rm -rf dist
    
    print_success "Build directories cleaned"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    pnpm install --frozen-lockfile
    
    print_success "Dependencies installed"
}

# Run linting
run_lint() {
    print_status "Running linting checks..."
    
    if ! pnpm lint; then
        print_error "Linting failed. Please fix the issues before building."
        exit 1
    fi
    
    print_success "Linting passed"
}

# Run type checking
run_typecheck() {
    print_status "Running TypeScript type checking..."
    
    if ! pnpm tsc --noEmit; then
        print_error "Type checking failed. Please fix the type errors before building."
        exit 1
    fi
    
    print_success "Type checking passed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    if ! pnpm test; then
        print_warning "Some tests failed. Continuing with build..."
    else
        print_success "All tests passed"
    fi
}

# Build the application
build_app() {
    print_status "Building the application..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build with Next.js
    if ! pnpm build; then
        print_error "Build failed"
        exit 1
    fi
    
    print_success "Application built successfully"
}

# Optimize build
optimize_build() {
    print_status "Optimizing build..."
    
    # Analyze bundle size
    if command -v npx &> /dev/null; then
        print_status "Analyzing bundle size..."
        npx @next/bundle-analyzer .next/static/chunks
    fi
    
    print_success "Build optimization completed"
}

# Generate static export (optional)
generate_static() {
    print_status "Generating static export..."
    
    if [ "$GENERATE_STATIC" = "true" ]; then
        if ! pnpm export; then
            print_warning "Static export failed, continuing..."
        else
            print_success "Static export generated"
        fi
    fi
}

# Security checks
security_checks() {
    print_status "Running security checks..."
    
    # Check for known vulnerabilities
    if command -v npx &> /dev/null; then
        print_status "Checking for known vulnerabilities..."
        npx audit --audit-level moderate || print_warning "Some vulnerabilities found"
    fi
    
    print_success "Security checks completed"
}

# Performance checks
performance_checks() {
    print_status "Running performance checks..."
    
    # Lighthouse CI (if available)
    if command -v npx &> /dev/null; then
        print_status "Running Lighthouse CI..."
        npx lhci autorun || print_warning "Lighthouse CI failed"
    fi
    
    print_success "Performance checks completed"
}

# Create build artifacts
create_artifacts() {
    print_status "Creating build artifacts..."
    
    # Create build info
    cat > .next/build-info.json << EOF
{
    "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "gitCommit": "$(git rev-parse HEAD)",
    "gitBranch": "$(git rev-parse --abbrev-ref HEAD)",
    "nodeVersion": "$(node --version)",
    "pnpmVersion": "$(pnpm --version)",
    "buildId": "$(date +%s)"
}
EOF
    
    print_success "Build artifacts created"
}

# Main build process
main() {
    print_status "Starting production build process..."
    
    check_dependencies
    clean_build
    install_dependencies
    run_lint
    run_typecheck
    run_tests
    build_app
    optimize_build
    generate_static
    security_checks
    performance_checks
    create_artifacts
    
    print_success "🎉 Production build completed successfully!"
    print_status "Build output is available in the .next directory"
    print_status "You can now deploy your application"
}

# Run main function
main "$@"
