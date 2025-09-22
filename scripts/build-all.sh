#!/bin/bash

# Build script for all platforms
# This script builds the application for Windows, macOS, and Linux

set -e  # Exit on any error

echo "🚀 Starting build process for all platforms..."

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
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
print_status "Cleaning previous builds..."
npm run clean

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build frontend
print_status "Building frontend..."
npm run build:frontend

# Check if frontend build was successful
if [ ! -d "frontend/dist" ]; then
    print_error "Frontend build failed. No dist directory found."
    exit 1
fi

print_success "Frontend build completed successfully!"

# Detect current platform
PLATFORM=$(uname -s)
print_status "Current platform: $PLATFORM"

# Build for current platform first
case $PLATFORM in
    "Darwin")
        print_status "Building for macOS..."
        npm run build:mac
        print_success "macOS build completed!"
        ;;
    "Linux")
        print_status "Building for Linux..."
        npm run build:linux
        print_success "Linux build completed!"
        ;;
    "MINGW"*|"CYGWIN"*|"MSYS"*)
        print_status "Building for Windows..."
        npm run build:win
        print_success "Windows build completed!"
        ;;
    *)
        print_warning "Unknown platform: $PLATFORM"
        print_status "Attempting to build for all platforms..."
        npm run build:all
        ;;
esac

# List built files
print_status "Build artifacts:"
if [ -d "dist" ]; then
    ls -la dist/
else
    print_warning "No dist directory found. Build may have failed."
fi

print_success "Build process completed!"
print_status "You can find the built applications in the 'dist' directory."

# Show next steps
echo ""
echo "📦 Distribution files created:"
echo "   • Windows: .exe installer in dist/"
echo "   • macOS: .dmg file in dist/"
echo "   • Linux: .AppImage file in dist/"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the applications on their respective platforms"
echo "   2. Distribute the installer files to users"
echo "   3. Users can install without any additional setup required"
