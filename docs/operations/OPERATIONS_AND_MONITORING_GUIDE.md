# Operations and Monitoring Guide — Drug Path Visualiser (BioLumen)

**Document:** `docs/operations/OPERATIONS_AND_MONITORING_GUIDE.md`  
**Version:** 1.0.0 (MVP Release v0.1.0-mvp)  
**Status:** Approved for Production Operations  
**Audience:** Site Reliability Engineers, DevOps, On-Call Engineers  

---

## 1. Health Probes & Operational Endpoints

BioLumen exposes dual health endpoints under `/api/v1/health` for monitoring agents, orchestrators (Kubernetes / ECS), and uptime checkers:

### 1. Liveness Probe: `GET /api/v1/health`
- **Purpose:** Verifies process execution and Node.js event loop responsiveness.
- **Response Format (HTTP 200):**
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "service": "drug-path-visualiser-backend",
      "uptimeSeconds": 14258,
      "environment": "production",
      "timestamp": "2026-10-22T20:30:00.000Z",
      "version": "0.1.0"
    },
    "meta": { "timestamp": "...", "version": "0.1.0" }
  }
  ```
- **Probe Recommendation:** Poll every 30 seconds. Restart container/service if 3 consecutive checks fail.

### 2. Readiness Probe: `GET /api/v1/health/ready`
- **Purpose:** Verifies that backend can communicate with PostgreSQL database pool.
- **Response Format (HTTP 200 - Ready):**
  ```json
  {
    "success": true,
    "data": {
      "status": "ready",
      "database": "connected",
      "service": "drug-path-visualiser-backend",
      "uptimeSeconds": 14258,
      "environment": "production",
      "timestamp": "...",
      "version": "0.1.0"
    }
  }
  ```
- **Response Format (HTTP 503 - Not Ready):**
  ```json
  {
    "success": false,
    "error": {
      "code": "SERVICE_UNAVAILABLE",
      "message": "Database connection is not ready to serve traffic."
    }
  }
  ```
- **Probe Recommendation:** Poll every 10 seconds. Remove instance from load balancer traffic pool if it returns 503.

---

## 2. Operational Signals & Monitoring Metrics

| Metric | Target / Normal Threshold | Warning Threshold | Critical Alert | Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **HTTP 5xx Error Rate** | $< 0.1\%$ | $> 1\%$ for 5 min | $> 5\%$ for 2 min | Inspect application logs; check database latency. |
| **API Response Latency (p95)**| $< 120\text{ms}$ | $> 350\text{ms}$ | $> 1000\text{ms}$ | Check PostgreSQL slow queries; check CPU saturation. |
| **PostgreSQL Connection Pool** | $2\text{--}8$ active connections | $> 15$ connections | $\ge 20$ (exhausted) | Increase `DB_POOL_MAX` or scale database replicas. |
| **Node.js Memory Usage (RSS)** | $< 250\text{MB}$ | $> 450\text{MB}$ | $> 700\text{MB}$ | Restart process; inspect for memory leak in static caches. |
| **Rate Limit Violations (429)** | Baseline $< 10/\text{hr}$ | $> 100/\text{hr}$ | $> 500/\text{hr}$ | Potential DDoS; inspect client IP traffic. |

---

## 3. Structured Logging & Sensitive Data Masking

### Standard Logging Contract
All backend operational events are written to `stdout` / `stderr` in unified format:
```text
[TIMESTAMP] [LEVEL] [MODULE] <MESSAGE> {context}
```

### Sensitive Data Masking Policy
Per BioLumen security guidelines, the following fields are strictly scrubbed before writing to logs:
- `password`, `token`, `authorization`, `cookie`, `secret`
- Patient/candidate emails (anonymized in log telemetry)
- Stack traces and database internals (masked in production responses)

---

## 4. Incident Response & Troubleshooting Runbook

### Incident A: HTTP 503 on `/health/ready` (Database Disconnected)
1. Check PostgreSQL service status:
   ```bash
   systemctl status postgresql
   # Or for Docker:
   docker logs biolumen_postgres_prod
   ```
2. Verify credentials and network reachability:
   ```bash
   pg_isready -h localhost -p 5432 -U biolumen_app
   ```
3. Check PostgreSQL connection limits in `postgresql.conf`:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

### Incident B: Rapid 429 RATE_LIMIT_EXCEEDED Errors
1. Inspect client IP distribution:
   - BioLumen enforces standard rate limits (100 req/min for general routes, 10 req/min for auth routes).
2. If legitimate traffic is throttled due to corporate NAT or proxy:
   - Update `TRUST_PROXY=true` in `server.ts` or adjust rate limiter window in `backend/src/middleware/rateLimiter.ts`.

### Incident C: High Memory Saturation in 3D WebGL Frontend
1. If client devices experience WebGL canvas crashes:
   - Confirm Three.js textures dispose when navigating between `/explore` and `/quiz`.
   - Verify `powerPreference: "high-performance"` is respected.
