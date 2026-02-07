#!/bin/bash
# Test-Rig Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/HCB-Consulting-ME/test-rig/main/deploy/install.sh | bash

set -e

echo "🔧 Installing Test-Rig..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ first: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required (current: v$NODE_VERSION)"
    exit 1
fi

# Install globally
echo "📦 Installing test-rig globally..."
npm install -g @hcb-consulting/test-rig

# Verify installation
if command -v test-rig &> /dev/null; then
    echo "✅ Test-Rig installed successfully!"
    echo ""
    test-rig --version
    echo ""
    echo "Quick start:"
    echo "  cd your-project"
    echo "  test-rig setup"
    echo "  test-rig run"
else
    echo "❌ Installation failed"
    exit 1
fi
