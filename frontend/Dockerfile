# ==============================================================================
# Drug Path Visualiser (BioLumen) — Frontend Production Dockerfile
# Multi-stage build producing static distribution served via Nginx Alpine.
# ==============================================================================

# Stage 1: Build & Bundle Compilation
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source and configuration
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/

# Build static production distribution in /app/dist
ARG VITE_API_BASE_URL="/api/v1"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: High-Performance Static Server (Nginx)
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets and SPA Nginx configuration from builder
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check probe
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
