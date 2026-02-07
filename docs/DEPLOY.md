# Test-Rig Deployment Guide

## Installation Methods

### 1. Global Installation (NPM)

```bash
npm install -g @hcb-consulting/test-rig
```

### 2. From Source

```bash
git clone https://github.com/HCB-Consulting-ME/test-rig
cd test-rig
npm install
npm run build
npm link
```

### 3. One-Line Install Script

```bash
curl -fsSL https://raw.githubusercontent.com/HCB-Consulting-ME/test-rig/main/deploy/install.sh | bash
```

## Server Deployment

### Option A: Direct Server Installation

```bash
# SSH to server
ssh user@your-server

# Clone repository
git clone https://github.com/HCB-Consulting-ME/test-rig /opt/test-rig
cd /opt/test-rig

# Install dependencies
npm install --production

# Build
npm run build

# Create global symlink
npm link

# Verify
test-rig --version
```

### Option B: Automated Deployment Script

```bash
# From local machine
cd test-rig
./deploy/deploy-server.sh your-server-ip
```

### Option C: Docker Deployment

```bash
# Build image
docker build -t test-rig:latest -f deploy/docker/Dockerfile .

# Run container
docker run -d \
  --name test-rig-api \
  -p 8080:8080 \
  test-rig:latest

# Or use docker-compose
cd deploy/docker
docker-compose up -d
```

### Option D: SystemD Service

```bash
# Copy service file
sudo cp deploy/systemd/test-rig-api.service /etc/systemd/system/

# Create test-rig user
sudo useradd -r -s /bin/false testrig

# Set ownership
sudo chown -R testrig:testrig /opt/test-rig

# Enable and start service
sudo systemctl enable test-rig-api
sudo systemctl start test-rig-api

# Check status
sudo systemctl status test-rig-api

# View logs
sudo journalctl -u test-rig-api -f
```

## API Server Mode

Run test-rig as an HTTP API:

```bash
test-rig serve --port 8080 --host 0.0.0.0
```

### API Endpoints

- `GET /health` - Health check
- `POST /test/run` - Run tests
- `POST /test/generate` - Generate tests
- `GET /test/status` - Get test status

### Example API Usage

```bash
# Health check
curl http://localhost:8080/health

# Run tests
curl -X POST http://localhost:8080/test/run \
  -H "Content-Type: application/json" \
  -d '{"type": "unit", "parallel": true, "agents": 4}'

# Generate tests
curl -X POST http://localhost:8080/test/generate \
  -H "Content-Type: application/json" \
  -d '{"component": "user-service"}'
```

## Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name test-rig.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

```bash
# Optional environment variables
export TEST_RIG_PORT=8080
export TEST_RIG_HOST=0.0.0.0
export NODE_ENV=production
```

## Security

### Create Dedicated User

```bash
sudo useradd -r -s /bin/false testrig
sudo chown -R testrig:testrig /opt/test-rig
```

### Firewall Rules

```bash
# Allow API port
sudo ufw allow 8080/tcp

# Or only from specific IP
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

## Monitoring

### Health Check Script

```bash
#!/bin/bash
# /opt/test-rig/health-check.sh

if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Test-Rig is healthy"
    exit 0
else
    echo "❌ Test-Rig is down"
    exit 1
fi
```

### Add to Cron

```bash
# Check every 5 minutes
*/5 * * * * /opt/test-rig/health-check.sh || systemctl restart test-rig-api
```

## Updating

### NPM Installation

```bash
npm update -g @hcb-consulting/test-rig
```

### From Source

```bash
cd /opt/test-rig
git pull
npm install
npm run build
systemctl restart test-rig-api
```

### Docker

```bash
docker pull test-rig:latest
docker-compose down
docker-compose up -d
```

## Troubleshooting

### Check Logs

```bash
# SystemD
sudo journalctl -u test-rig-api -n 100 -f

# Docker
docker logs test-rig-api -f
```

### Verify Installation

```bash
test-rig --version
test-rig doctor
```

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Change port
test-rig serve --port 8081
```

## Uninstall

### NPM

```bash
npm uninstall -g @hcb-consulting/test-rig
```

### From Source

```bash
npm unlink
rm -rf /opt/test-rig
```

### SystemD Service

```bash
sudo systemctl stop test-rig-api
sudo systemctl disable test-rig-api
sudo rm /etc/systemd/system/test-rig-api.service
sudo systemctl daemon-reload
```
