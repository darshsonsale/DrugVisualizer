# API Contract Freeze (Task 20)

**Freeze Date:** October 15, 2026  
**Document Status:** Locked & Immutable for MVP v1.0  
**Scope:** Backend API Endpoints, Request/Response Envelopes, DTOs, Error Codes, and Security Headers

---

## 1. Executive Summary & Freeze Declaration

As of the completion of **Task 20 (Backend Integration and API Contract Freeze)**, the RESTful HTTP API for the Drug Path Visualiser platform is formally frozen. 

This contract freeze establishes an immutable integration baseline between:
1. **Backend Service** (Express + TypeScript + PostgreSQL engine on port 3000)
2. **Frontend Client** (React + TypeScript + Three.js BioLumen UI on port 5174)
3. **Automated Verification Pipelines** (`npm run test:contract`, regression suites)

No breaking changes to endpoint paths, HTTP verbs, payload contracts, envelope schemas, status codes, or error hierarchies may be introduced during subsequent tasks without formal version bumping (`/api/v2/`) or explicit stakeholder approval.

---

## 2. Frozen Envelope Specifications

All implemented platform endpoints adhere to standard, predictable envelope formats. Clients MUST NOT parse raw unwrapped JSON.

### 2.1 Standard Success Envelope
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;      // ISO 8601 formatted UTC timestamp
    version?: string;        // API version indicator (e.g., "0.1.0")
    [key: string]: unknown;  // Optional pagination or query echoes
  };
}
```

### 2.2 Standard Error Envelope
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;            // Standardized machine-readable error token
    message: string;         // Human-readable diagnostic description
    details?: unknown;       // Array of validation issues or contextual diagnostics
  };
  meta: {
    timestamp: string;      // ISO 8601 formatted UTC timestamp
  };
}
```

### 2.3 Canonical Error Code Registry
The following machine-readable error tokens are frozen:
- `VALIDATION_ERROR` (400): Request schema validation failed (Zod check).
- `BAD_REQUEST` (400): Request business logic violation (e.g. duplicate quiz questions, invalid option selections).
- `AUTHENTICATION_REQUIRED` (401): Missing, malformed, or invalid bearer token.
- `FORBIDDEN` (403): Authenticated user lacks permission or does not own the requested resource.
- `RESOURCE_NOT_FOUND` (404): The requested medicine, pathway, quiz, or user does not exist.
- `PAYLOAD_TOO_LARGE` (413): Request body exceeds the 100kb payload ceiling.
- `RATE_LIMIT_EXCEEDED` (429): Client exceeded sliding rate limit window.
- `INTERNAL_SERVER_ERROR` (500): Unhandled exception. (Stack traces and internal database diagnostics are redacted in all environments).

---

## 3. Verified Endpoint Inventory (31 Endpoints)

| Group | Method | Path | Auth / Role | Contract Description |
|---|---|---|---|---|
| **Root Probe** | `GET` | `/` | Anonymous | Service information probe |
| **Health** | `GET` | `/api/v1/health` | Anonymous | System and operational health status |
| **Drugs** | `GET` | `/api/v1/drugs` | Anonymous | Active medicine catalog (all 4 medicines) |
| | `GET` | `/api/v1/drugs/:drugId` | Anonymous | Single medicine by UUID or short slug |
| | `GET` | `/api/v1/drugs/:drugId/pathway` | Anonymous | Physiological pathway graph (?condition=BEFORE_FOOD\|AFTER_FOOD) |
| **Pathways** | `GET` | `/api/v1/pathways/:pathwayId` | Anonymous | Pathway graph topology by pathway ID |
| | `GET` | `/api/v1/pathways/:pathwayId/nodes` | Anonymous | Ordered pathway nodes with anatomical details |
| | `GET` | `/api/v1/pathways/:pathwayId/edges` | Anonymous | Directed edges connecting pathway nodes |
| **Content** | `GET` | `/api/v1/content` | Anonymous | Educational content module status |
| **Quizzes** | `GET` | `/api/v1/quizzes` | Anonymous | Quiz module status |
| | `GET` | `/api/v1/quizzes/drug/:drugId` | Anonymous | Drug-associated quiz with confidential options |
| | `GET` | `/api/v1/quizzes/:quizId` | Anonymous | Single quiz by ID with answers withheld |
| | `POST` | `/api/v1/quizzes/:quizId/attempts` | Anonymous / Auth | Submit attempt, zero-trust grading, unlock feedback |
| | `GET` | `/api/v1/quiz` | Anonymous | Singular alias for quiz module status |
| | `GET` | `/api/v1/quiz/drug/:drugId` | Anonymous | Singular alias for quiz by drug lookup |
| | `GET` | `/api/v1/quiz/:quizId` | Anonymous | Singular alias for quiz by ID lookup |
| | `POST` | `/api/v1/quiz/:quizId/attempts` | Anonymous / Auth | Singular alias for quiz attempt submission |
| **Progress** | `GET` | `/api/v1/progress/:drugId` | Anonymous / Auth | Learning milestones (in-memory or persisted) |
| | `PUT` | `/api/v1/progress/:drugId` | Authenticated | Update learning milestones (requires auth) |
| **Auth** | `GET` | `/api/v1/auth/` | Anonymous | Auth module status |
| | `GET` | `/api/v1/auth/google/url` | Anonymous | Obtain Google OAuth URL with CSRF state |
| | `GET` | `/api/v1/auth/google/callback` | Anonymous | Google OAuth redirect callback handler |
| | `POST` | `/api/v1/auth/google/verify` | Anonymous | Google Identity Services ID token verification |
| | `GET` | `/api/v1/auth/me` | Authenticated | Current authenticated user profile |
| | `POST` | `/api/v1/auth/logout` | Anonymous / Auth | Terminate current user session |
| **Users** | `GET` | `/api/v1/users/me/progress` | Authenticated | Current user's progress records |
| | `GET` | `/api/v1/users/me/attempts` | Authenticated | Current user's quiz attempt history |
| | `GET` | `/api/v1/users/me/overview` | Authenticated | Current user's learning dashboard overview |
| | `GET` | `/api/v1/users/:userId/progress` | Authenticated | Parameterized progress (ownership enforced) |
| | `GET` | `/api/v1/users/:userId/attempts` | Authenticated | Parameterized quiz attempts (ownership enforced) |
| **Admin** | `GET` | `/api/v1/admin/` | Admin Only | Administrative module status |
| | `GET` | `/api/v1/admin/users` | Admin Only | User directory listing |
| | `PATCH` | `/api/v1/admin/users/:userId/role` | Admin Only | Role update (`learner` / `admin`) |
| | `GET` | `/api/v1/admin/metrics` | Admin Only | Global platform analytics & metrics |
| | `GET` | `/api/v1/admin/users/:userId/progress` | Admin Only | Cross-user administrative progress inspection |

---

## 4. Medicine & Formulation Rules

The contract guarantees specific pharmacokinetic and formulation behaviors for the 4 MVP medicines:

1. **Ibuprofen (`drug-ibuprofen-001` | slug `ibuprofen`):**
   - Formulation: Oral solid tablet.
   - Variations: `BEFORE_FOOD` (fast absorption, gastric irritation risk) and `AFTER_FOOD` (delayed Tmax, cushioned gastric mucosa).
2. **Amoxicillin (`drug-amoxicillin-002` | slug `amoxicillin`):**
   - Formulation: Oral solid capsule.
   - Variations: `BEFORE_FOOD` (rapid transit) and `AFTER_FOOD` (buffered GI tolerance, unaltered overall AUC).
3. **Ambroxol Syrup (`drug-ambroxol-003` | slug `ambroxol`):**
   - Formulation: Oral liquid syrup.
   - Variations: `BEFORE_FOOD` and `AFTER_FOOD` (secretolytic action preserved, high mucosal tolerance).
4. **Insulin (`drug-insulin-004` | slug `insulin`):**
   - Formulation: Subcutaneous injection.
   - Variations: `BEFORE_FOOD` (preprandial administration timed to glucose intake; postprandial subcutaneous injection is medically contraindicated in standard therapy).

---

## 5. Security & Boundary Rules

1. **Security Headers (Helmet):** All responses enforce `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Strict-Transport-Security`.
2. **Payload Limit:** JSON body parsing is locked to 100kb maximum. Larger bodies trigger `413 PAYLOAD_TOO_LARGE`.
3. **Data Ownership (IDOR Prevention):** Users cannot access `/api/v1/users/:userId/*` or tamper with `user_id` in progress payloads. Violations return `403 FORBIDDEN`.
4. **Role-Based Access Control:** Routes under `/api/v1/admin/*` require `req.auth.role === 'admin'`. Non-admin accounts receive `403 FORBIDDEN`.
5. **No Stack Traces / Leakage:** Unhandled exceptions return generic message `An unexpected error occurred.` with standard timestamp metadata.
