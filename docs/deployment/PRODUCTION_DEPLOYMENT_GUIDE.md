# Production Deployment Guide — Drug Path Visualiser (BioLumen)

**Document:** `docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md`  
**Version:** 1.0.0 (MVP Release v0.1.0-mvp)  
**Status:** Approved for Production Deployment  
**Audience:** DevOps Engineers, System Administrators, Deployment Leads  

---

## 1. Architecture & Deployment Topology

Drug Path Visualiser (BioLumen) is structured as a two-tier modular web application backed by a relational PostgreSQL database:

```
[ Client Browsers / Mobile ]
            │ (HTTPS :443)
            ▼
[ Reverse Proxy / Nginx / Load Balancer ]
       │                                │
       ▼ (/api/v1/*)                    ▼ (/*)
[ Node.js Express Backend ]    [ Static Vite Distribution ]
   (Cluster / PM2 / Container)    (Cached SPA / CDN / Nginx)
       │ (TLS Connection Pool)
       ▼
[ PostgreSQL 14+ Database ]
```

---

## 2. Infrastructure & System Prerequisites

### Minimum Hardware Sizing (MVP Baseline)
- **Web / API Server:** 1 vCPU, 2 GB RAM, 20 GB SSD storage.
- **Database Server:** 1 vCPU, 2 GB RAM, 20 GB SSD (or managed PostgreSQL equivalent e.g., AWS RDS, GCP Cloud SQL, Supabase, Neon).

### Software Requirements
- **Operating System:** Linux (Ubuntu 22.04 LTS or Debian 12 recommended).
- **Node.js Runtime:** v18.x or v20.x LTS.
- **Package Manager:** npm v9+.
- **Database Engine:** PostgreSQL 14, 15, or 16.
- **Reverse Proxy / TLS:** Nginx 1.22+ or Caddy with Let's Encrypt / Cloudflare SSL.

---

## 3. Environment Variable Provisioning

Production secrets must be supplied via secure environment variables or a key management vault (e.g., AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault). Never commit real secrets to source control.

| Environment Variable | Category | Description | Production Requirement |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Runtime | Application environment mode | Must be strictly set to `production`. |
| `PORT` | Network | Backend internal listening port | Default `3000` (reverse-proxied). |
| `DATABASE_URL` | Database | Full PostgreSQL connection string | `postgresql://<user>:<pass>@<host>:5432/<db>?sslmode=require` |
| `CORS_ORIGIN` | Security | Whitelisted client origins | Explicit production domain(s) (e.g., `https://biolumen.org`). |
| `JWT_SECRET` | Security | HMAC secret for session tokens | $\ge 32$ chars high-entropy hex string (`openssl rand -hex 32`). |
| `SESSION_SECRET` | Security | CSRF / session encryption key | $\ge 32$ chars cryptographic random string. |
| `ADMIN_EMAILS` | RBAC | Comma-delimited admin emails | Designates administrative access for content management. |
| `GOOGLE_CLIENT_ID` | Auth | Google OAuth 2.0 Web Client ID | From Google Cloud Console (APIs & Services). |
| `GOOGLE_CLIENT_SECRET`| Auth | Google OAuth 2.0 Client Secret | From Google Cloud Console. |
| `GOOGLE_REDIRECT_URI` | Auth | Public OAuth callback URL | `https://api.yourdomain.com/api/v1/auth/google/callback` |
| `VITE_API_BASE_URL` | Frontend | Client-facing backend URL | `/api/v1` (relative via reverse proxy) or public API URL. |

---

## 4. Standard Deployment Options

### Option A: Containerized Deployment (Recommended)
1. **Clone repository and configure environment:**
   ```bash
   git clone https://github.com/darshsonsale/DrugVisualizer.git
   cd DrugVisualizer
   cp .env.example .env.prod
   # Edit .env.prod with verified production secrets
   ```
2. **Build and launch containers:**
   ```bash
   docker compose -f docker-compose.prod.yml.example --env-file .env.prod up -d --build
   ```
3. **Execute database migrations & baseline seeder:**
   ```bash
   docker exec -it biolumen_backend_prod npm run db:migrate:prod
   docker exec -it biolumen_backend_prod npm run db:seed:prod
   ```

### Option B: Bare-Metal / Virtual Machine (systemd or PM2)
1. **Build Frontend Static Assets:**
   ```bash
   cd frontend
   npm ci
   npm run build
   # Copies output in frontend/dist to /var/www/biolumen/
   ```
2. **Build Backend Production Application:**
   ```bash
   cd ../backend
   npm ci
   npm run build
   npm prune --production
   ```
3. **Run Database Migrations & Baseline Seeder:**
   ```bash
   npm run db:migrate:prod
   npm run db:seed:prod
   ```
4. **Configure PM2 Process Manager:**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "biolumen-api" -i max --env production
   pm2 save
   pm2 startup
   ```

---

## 5. Nginx Reverse Proxy & TLS Configuration

Place `nginx.conf.example` into `/etc/nginx/sites-available/biolumen` and symlink to `sites-enabled`. Ensure Let's Encrypt certificates are installed via Certbot:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Key Nginx directives:
- Proxy `/api/v1/` to `http://127.0.0.1:3000`.
- Cache static assets (`/assets/`) for 1 year with `immutable`.
- Serve SPA fallback: `try_files $uri $uri/ /index.html;`.

---

## 6. Zero-Downtime Migration & Deployment Sequence

To avoid breaking running client sessions:
1. **Pre-Deployment:**
   - Execute database backup using `pg_dump` (see `BACKUP_AND_RECOVERY_RUNBOOK.md`).
   - Run readiness check: `curl -I https://api.yourdomain.com/api/v1/health/ready`.
2. **Database Migration:**
   - Run `npm run migrate:up`. Migrations in `0001`–`0007` are strictly additive and backward-compatible.
3. **Application Rolling Restart:**
   - For PM2: `pm2 reload biolumen-api`.
   - For Docker: `docker compose up -d --no-deps --build backend`.
4. **Post-Deployment Validation:**
   - Confirm liveness: `GET /api/v1/health` $\rightarrow$ 200 OK.
   - Confirm readiness: `GET /api/v1/health/ready` $\rightarrow$ 200 OK (`database: connected`).
