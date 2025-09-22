#!/bin/bash

# CodeDuet New Computer Setup Script
# This script sets up CodeDuet on a new computer or after a fresh git clone

set -e

echo "🚀 Setting up CodeDuet on new computer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 20 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Verify and fix packages (this will also run automatically after npm install)
echo "🔍 Verifying packages..."
npm run verify-packages

# Build packages
echo "🔨 Building packages..."
npm run build:packages

# Run TypeScript check
echo "🔎 Running TypeScript check..."
npm run ts

echo ""
echo "✅ Setup complete! You can now run:"
echo "   npm start          # Start development server"
echo "   npm run package    # Build for distribution"
echo "   npm run verify-packages  # Re-verify packages if issues arise"
echo ""
echo "🎉 CodeDuet is ready to use!"