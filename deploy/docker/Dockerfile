FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --production && npm cache clean --force

# Copy built files
COPY --from=builder /app/dist ./dist

# Create symlink
RUN ln -s /app/dist/cli/index.js /usr/local/bin/test-rig && \
    chmod +x /usr/local/bin/test-rig

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 8080

CMD ["test-rig", "serve", "--port", "8080", "--host", "0.0.0.0"]
