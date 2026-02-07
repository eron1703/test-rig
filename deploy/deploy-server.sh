#!/bin/bash
# Deploy Test-Rig to Server
# Usage: ./deploy-server.sh [server-ip]

set -e

SERVER=${1:-"your-server-ip"}
DEPLOY_PATH="/opt/test-rig"
USER="root"

echo "🚀 Deploying Test-Rig to $SERVER..."

# Build locally
echo "📦 Building..."
npm run build

# Create deployment package
echo "📦 Creating package..."
tar -czf test-rig.tar.gz \
    dist/ \
    package.json \
    package-lock.json \
    README.md

# Upload to server
echo "📤 Uploading to server..."
scp test-rig.tar.gz $USER@$SERVER:/tmp/

# Install on server
echo "🔧 Installing on server..."
ssh $USER@$SERVER <<'ENDSSH'
# Stop existing service if running
systemctl stop test-rig-api || true

# Create directory
mkdir -p /opt/test-rig
cd /opt/test-rig

# Extract files
tar -xzf /tmp/test-rig.tar.gz
rm /tmp/test-rig.tar.gz

# Install dependencies
npm install --production

# Create symlink
ln -sf /opt/test-rig/dist/cli/index.js /usr/local/bin/test-rig
chmod +x /usr/local/bin/test-rig

# Verify
test-rig --version

echo "✅ Test-Rig deployed successfully!"
ENDSSH

# Clean up
rm test-rig.tar.gz

echo "✅ Deployment complete!"
echo ""
echo "To start API server on remote:"
echo "  ssh $USER@$SERVER"
echo "  systemctl start test-rig-api"
