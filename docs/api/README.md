# API Documentation & Architecture Overview

**Platform:** Drug Path Visualiser  
**Version:** 0.1.0 (MVP)  
**Contract Baseline:** Task 20 Backend Integration and API Contract Freeze  
**Backend Base URL:** `http://localhost:3000` (API prefix: `/api/v1`)  
**Frontend URL:** `http://localhost:5174`

---

## 1. Architectural Principles

The Drug Path Visualiser backend is architected as a modular monolith in TypeScript and Express, backed by a normalized PostgreSQL relational database. The API design adheres strictly to the following standards:

1. **Standardized Response Envelopes:** All responses (success or error) are wrapped in consistent JSON envelopes. Raw unformatted objects or arrays are never returned directly.
2. **Deterministic Status Codes:** REST semantics are strictly enforced:
   - `200 OK`: Successful resource retrieval or mutation.
   - `201 Created`: Successful creation of a new entity (e.g., quiz attempts).
   - `400 Bad Request / VALIDATION_ERROR`: Zod schema validation failed or business rule violation.
   - `401 Unauthorized`: Missing, expired, or malformed authentication token.
   - `403 Forbidden`: User lacks permission (e.g. learner accessing admin resources or accessing another user's data).
   - `404 Not Found / RESOURCE_NOT_FOUND`: Target resource or identifier does not exist.
   - `413 Payload Too Large / PAYLOAD_TOO_LARGE`: Request payload exceeds 100kb limit.
   - `429 Too Many Requests / RATE_LIMIT_EXCEEDED`: Exceeded rate limiting policy quota.
   - `500 Internal Server Error`: Unhandled exception. Stack traces and raw database errors are strictly redacted across all environments.
3. **Four-Medicine Data Model:** The platform serves four reference medicines with realistic pharmacokinetic profiles and formulation variations:
   - **Ibuprofen** (`drug-ibuprofen-001`, slug: `ibuprofen`): Oral Solid (Tablets)
   - **Amoxicillin** (`drug-amoxicillin-002`, slug: `amoxicillin`): Oral Solid (Capsules)
   - **Ambroxol Syrup** (`drug-ambroxol-003`, slug: `ambroxol`): Oral Liquid (Syrup)
   - **Insulin** (`drug-insulin-004`, slug: `insulin`): Subcutaneous Injection
4. **Food Condition Variations:**
   - Oral medicines (Ibuprofen, Amoxicillin, Ambroxol syrup) support physiological comparisons under `BEFORE_FOOD` (fasted) and `AFTER_FOOD` (fed) states.
   - Subcutaneous Insulin operates under `BEFORE_FOOD` (preprandial timing); postprandial administration is not applicable for this formulation.

---

## 2. Global Security & Rate Limiting

### 2.1 HTTP Security Headers
All HTTP responses include security headers enforced by centralized middleware:
- `Content-Security-Policy`: Default directive restricts scripts and styles.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `X-Frame-Options: SAMEORIGIN`: Protects against clickjacking.
- `Strict-Transport-Security`: HSTS policy enabled.
- `X-XSS-Protection: 0`: Modern standard deactivating legacy buggy auditor in favor of CSP.

### 2.2 Rate Limiting Policies
Three sliding-window rate limit tiers protect platform availability:
- **Standard Tier:** 100 requests / 15 minutes (applied globally to all `/api/v1/*` routes).
- **Sensitive Tier:** 45 requests / 5 minutes (applied to authentication and quiz attempt submissions).
- **Admin Tier:** 30 requests / 5 minutes (applied to administrative user mutations and role changes).

---

## 3. Verified Endpoint Summary (21 Implemented Endpoints)

The implementation consists of **21 verified, actively registered REST endpoints** mounted across 9 modular routers:

1. `GET /` — Root probe returning operational status.
2. `GET /api/v1/health` — System and database connectivity check.
3. `GET /api/v1/drugs` — List all active medicines.
4. `GET /api/v1/drugs/:drugId` — Retrieve single medicine by UUID or slug.
5. `GET /api/v1/drugs/:drugId/pathway` — Physiological pathway graph for medicine (supports `?condition=BEFORE_FOOD|AFTER_FOOD`).
6. `GET /api/v1/pathways/:pathwayId` — Pathway metadata and graph topology by pathway ID.
7. `GET /api/v1/pathways/:pathwayId/nodes` — Ordered pathway nodes with anatomical and cellular content.
8. `GET /api/v1/pathways/:pathwayId/edges` — Directed edges and transition durations for a pathway.
9. `GET /api/v1/content` — Educational content module status.
10. `GET /api/v1/quizzes` (and `GET /api/v1/quiz`) — Diagnostic quiz module status.
11. `GET /api/v1/quizzes/drug/:drugId` (and `GET /api/v1/quiz/drug/:drugId`) — Quiz questions & options for medicine (answers withheld).
12. `GET /api/v1/quizzes/:quizId` (and `GET /api/v1/quiz/:quizId`) — Quiz details with answer confidentiality strictly enforced.
13. `POST /api/v1/quizzes/:quizId/attempts` (and `POST /api/v1/quiz/:quizId/attempts`) — Submit answers, execute zero-trust grading, unlock feedback.
14. `GET /api/v1/progress/:drugId` — Retrieve learning milestones for a medicine.
15. `PUT /api/v1/progress/:drugId` — Save learning milestones for a medicine (requires auth context).
16. `GET /api/v1/auth/` — Authentication module status.
17. `GET /api/v1/auth/google/url` — Obtain Google OAuth 2.0 authorization URL with CSRF state token.
18. `GET /api/v1/auth/google/callback` — Google OAuth redirect handler.
19. `POST /api/v1/auth/google/verify` — Google Identity Services ID token verification.
20. `GET /api/v1/auth/me` — Current authenticated user profile.
21. `POST /api/v1/auth/logout` — Terminate session.
22. `GET /api/v1/users/me/progress` — Current user's progress records.
23. `GET /api/v1/users/me/attempts` — Current user's quiz attempt history.
24. `GET /api/v1/users/me/overview` — Current user's learning summary dashboard.
25. `GET /api/v1/users/:userId/progress` — Parameterized progress (ownership enforced).
26. `GET /api/v1/users/:userId/attempts` — Parameterized quiz attempts (ownership enforced).
27. `GET /api/v1/admin/` — Administrative module status.
28. `GET /api/v1/admin/users` — User directory listing (Admin only).
29. `PATCH /api/v1/admin/users/:userId/role` — Update user role (Admin only).
30. `GET /api/v1/admin/metrics` — Platform telemetry and operational metrics (Admin only).
31. `GET /api/v1/admin/users/:userId/progress` — Cross-user progress inspection (Admin only).

For full input/output schemas and examples, see [endpoints.md](./endpoints.md).
