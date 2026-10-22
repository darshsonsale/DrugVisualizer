# ==============================================================================
# Drug Path Visualiser (BioLumen) — Backend Production Dockerfile
# Multi-stage build producing an optimized, non-root Node.js production runtime.
# ==============================================================================

# Stage 1: Build & TypeScript Compilation
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy backend source code and TypeScript config
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# ------------------------------------------------------------------------------
# Stage 2: Production Minimal Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Enforce production environment
ENV NODE_ENV=production
ENV PORT=3000

# Security: Run as unprivileged node user (non-root)
USER node

# Copy production dependencies and compiled artifacts from builder
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node src/database/migrations ./src/database/migrations
COPY --chown=node:node src/database/migrations ./dist/database/migrations
COPY --chown=node:node data ./data

# Expose API port
EXPOSE 3000

# Health check against liveness endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Start the application server
CMD ["node", "dist/server.js"]
