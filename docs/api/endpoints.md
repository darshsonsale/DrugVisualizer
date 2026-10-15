# Drug Path Visualiser — API Endpoint Reference

**Base URL:** `http://localhost:3000/api/v1`  
**Total Verified Endpoints:** 31 (1 Root Probe + 30 Domain Routes)

---

## 1. System & Health

### `GET /`
- **Description:** Root server status and welcome probe.
- **Auth:** Public
- **Response (200 OK):**
```json
{
  "service": "drug-path-visualiser-backend",
  "version": "0.1.0",
  "status": "operational",
  "documentation": "/api/v1/health"
}
```

### `GET /api/v1/health`
- **Description:** Operational liveness and health telemetry.
- **Auth:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "drug-path-visualiser-backend",
    "uptimeSeconds": 1420,
    "environment": "development",
    "timestamp": "2026-10-15T16:00:00.000Z",
    "version": "0.1.0"
  },
  "meta": {
    "timestamp": "2026-10-15T16:00:00.000Z",
    "version": "0.1.0"
  }
}
```

---

## 2. Drug Catalog

### `GET /api/v1/drugs`
- **Description:** Returns the catalog of all available medicines.
- **Auth:** Public
- **Response (200 OK):** `ApiResponse<DrugSummaryDto[]>`
```json
{
  "success": true,
  "data": [
    {
      "id": "drug-ibuprofen-001",
      "name": "Ibuprofen",
      "brand_name": "Advil / Motrin (400 mg tablet)",
      "category": "NSAID (Non-Steroidal Anti-Inflammatory Drug)",
      "description": "Inhibits cyclooxygenase enzymes COX-1 and COX-2...",
      "half_life_hours": 2,
      "bioavailability_pct": 88,
      "tmax_hours": 0.75,
      "form": "Tablets",
      "dosage": "400 mg Tablet",
      "route": "Oral Route"
    }
  ],
  "meta": { "timestamp": "2026-10-15T16:00:00.000Z" }
}
```

### `GET /api/v1/drugs/:drugId`
- **Description:** Retrieves single drug details by canonical ID or short slug (`ibuprofen`, `amoxicillin`, `ambroxol`, `insulin`).
- **Auth:** Public
- **Parameters:** `drugId` (string, required)
- **Response (200 OK):** `ApiResponse<DrugSummaryDto>`
- **Errors:** `404 RESOURCE_NOT_FOUND`

### `GET /api/v1/drugs/:drugId/pathway`
- **Description:** Retrieves physiological pathway graph (drug, pathway metadata, ordered nodes, directed edges) for a given medicine under an optional physiological food state.
- **Auth:** Public
- **Parameters:** `drugId` (string, required)
- **Query:** `condition` (`BEFORE_FOOD` | `AFTER_FOOD`, optional, default: `BEFORE_FOOD`)
- **Response (200 OK):** `ApiResponse<PathwayGraphResponseDto>`
```json
{
  "success": true,
  "data": {
    "drug": { "id": "drug-ibuprofen-001", "name": "Ibuprofen", ... },
    "pathway": {
      "id": "pathway-ibuprofen-fasting",
      "drug_id": "drug-ibuprofen-001",
      "name": "Ibuprofen Oral Absorption Pathway (Fasting / Before Food)",
      "condition": "BEFORE_FOOD"
    },
    "nodes": [
      {
        "id": "node-ibu-mouth",
        "pathway_id": "pathway-ibuprofen-fasting",
        "node_order": 1,
        "name": "Oral Cavity",
        "anatomical_location": "Mouth",
        "organ_system": "Digestive",
        "estimated_time_minutes": 1,
        "content": {
          "general_description": "Initial ingestion...",
          "physiological_role": "Wetting and swallowing..."
        },
        "variation": {
          "condition": "BEFORE_FOOD",
          "transit_time_modifier_pct": 0,
          "clinical_observation": "Rapid transit"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-ibu-1",
        "from_node_id": "node-ibu-mouth",
        "to_node_id": "node-ibu-stomach",
        "transition_duration_minutes": 1
      }
    ]
  },
  "meta": { "timestamp": "2026-10-15T16:00:00.000Z" }
}
```
- **Errors:** `400 INVALID_FOOD_CONDITION`, `404 RESOURCE_NOT_FOUND`

---

## 3. Pathways & Graph Topology

### `GET /api/v1/pathways/:pathwayId`
- **Description:** Retrieves full graph by pathway ID.
- **Auth:** Public
- **Query:** `condition` (`BEFORE_FOOD` | `AFTER_FOOD`, optional)
- **Response (200 OK):** `ApiResponse<PathwayGraphResponseDto>`
- **Errors:** `404 RESOURCE_NOT_FOUND`

### `GET /api/v1/pathways/:pathwayId/nodes`
- **Description:** Retrieves ordered nodes with content and variation for a pathway.
- **Auth:** Public
- **Query:** `condition` (optional)
- **Response (200 OK):** `ApiResponse<PathwayNodeWithDetailsDto[]>`

### `GET /api/v1/pathways/:pathwayId/edges`
- **Description:** Retrieves topological directed edges connecting nodes within a pathway.
- **Auth:** Public
- **Response (200 OK):** `ApiResponse<PathwayEdgeDto[]>`

---

## 4. Educational Content

### `GET /api/v1/content`
- **Description:** Content module status.
- **Auth:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "module": "content",
    "status": "initialized",
    "description": "Educational definitions, organ roles & fun facts module"
  }
}
```

---

## 5. Quizzes & Self-Assessment

### `GET /api/v1/quizzes` (also `GET /api/v1/quiz`)
- **Description:** Quiz module status.
- **Auth:** Public

### `GET /api/v1/quizzes/drug/:drugId`
- **Description:** Retrieves quiz associated with a specific medicine.
- **Auth:** Public
- **Parameters:** `drugId` (string, required)
- **Response (200 OK):** `ApiResponse<QuizResponseDto>` (Note: `is_correct` and explanations are strictly withheld prior to attempt submission).
- **Errors:** `404 RESOURCE_NOT_FOUND`

### `GET /api/v1/quizzes/:quizId`
- **Description:** Retrieves quiz by quiz ID with answer confidentiality enforced.
- **Auth:** Public
- **Response (200 OK):** `ApiResponse<QuizResponseDto>`

### `POST /api/v1/quizzes/:quizId/attempts`
- **Description:** Submits student answers, executes server-side grading, unlocks educational explanations, and persists attempt if authenticated.
- **Auth:** Public (anonymous submissions graded in-memory without persistence)
- **Rate Limit:** Sensitive Tier (45 requests / 5 min)
- **Request Body:**
```json
{
  "answers": [
    {
      "question_id": "q1",
      "selected_option_id": "opt1-a"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "attempt-uuid",
    "quiz_id": "quiz-ibuprofen-001",
    "score": 100,
    "total_questions": 2,
    "correct_answers": 2,
    "passed": true,
    "completed_at": "2026-10-15T16:00:00.000Z",
    "details": [
      {
        "question_id": "q1",
        "correct": true,
        "explanation": "Ibuprofen non-selectively inhibits COX enzymes..."
      }
    ]
  },
  "meta": { "timestamp": "2026-10-15T16:00:00.000Z" }
}
```
- **Errors:** `400 VALIDATION_ERROR`, `400 BAD_REQUEST` (duplicate questions or mismatched options), `404 RESOURCE_NOT_FOUND`

---

## 6. Learning Progress Tracking

### `GET /api/v1/progress/:drugId`
- **Description:** Retrieves milestone completion progress for a medicine.
- **Auth:** Public (returns ephemeral in-memory defaults when unauthenticated; returns database persistence when authenticated)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "progress-uuid",
    "drug_id": "drug-ibuprofen-001",
    "completed_nodes": ["node-ibu-mouth", "node-ibu-stomach"],
    "quiz_score": 100,
    "quiz_completed": true,
    "last_accessed": "2026-10-15T16:00:00.000Z"
  },
  "meta": {
    "timestamp": "2026-10-15T16:00:00.000Z",
    "persistent": true
  }
}
```

### `PUT /api/v1/progress/:drugId`
- **Description:** Persists updated node completions and study duration.
- **Auth:** Required (`Bearer <JWT>`)
- **Rate Limit:** Sensitive Tier
- **Request Body:**
```json
{
  "completed_nodes": ["node-ibu-mouth", "node-ibu-stomach", "node-ibu-small-intestine"],
  "last_active_node_id": "node-ibu-small-intestine",
  "time_spent_seconds": 180
}
```
- **Response (200 OK):** `ApiResponse<UserProgressDto>`
- **Errors:** `401 AUTHENTICATION_REQUIRED`, `403 FORBIDDEN` (if user_id payload does not match token)

---

## 7. Authentication & Identity

### `GET /api/v1/auth/`
- **Description:** Auth module status.
- **Auth:** Public

### `GET /api/v1/auth/google/url`
- **Description:** Generates Google OAuth 2.0 consent URL with signed CSRF state token.
- **Auth:** Public
- **Rate Limit:** Sensitive Tier
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "state": "csrf-state-uuid.signature"
  }
}
```

### `GET /api/v1/auth/google/callback`
- **Description:** Google OAuth 2.0 redirect receiver. Exchanges code, upserts user, and returns postMessage script (for popup windows) or session JSON.
- **Auth:** Public

### `POST /api/v1/auth/google/verify`
- **Description:** Authenticates Google Identity Services (GIS) ID tokens.
- **Auth:** Public
- **Rate Limit:** Sensitive Tier
- **Request Body:** `{ "id_token": "<google_id_token>" }` or `{ "idToken": "<google_id_token>" }`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "expires_in": "7d",
    "user": {
      "id": "usr-uuid",
      "email": "user@biolumen.org",
      "name": "Alex Morgan",
      "avatar_url": "https://...",
      "role": "learner",
      "created_at": "2026-10-15T16:00:00.000Z"
    }
  }
}
```
- **Errors:** `400 VALIDATION_ERROR`, `401 AUTHENTICATION_REQUIRED`

### `GET /api/v1/auth/me`
- **Description:** Returns profile of current authenticated user.
- **Auth:** Required (`Bearer <JWT>`)
- **Response (200 OK):** `ApiResponse<UserProfileDto>`
- **Errors:** `401 AUTHENTICATION_REQUIRED`

### `POST /api/v1/auth/logout`
- **Description:** Terminate user session.
- **Auth:** Public
- **Response (200 OK):** `{ "success": true, "data": { "message": "Logged out successfully" } }`

---

## 8. User Learning Dashboards (Ownership-Enforced)

### `GET /api/v1/users/me/progress`
- **Description:** Lists all drug progress records for the authenticated user.
- **Auth:** Required (`Bearer <JWT>`)
- **Response (200 OK):** `ApiResponse<UserProgressDto[]>`

### `GET /api/v1/users/me/attempts`
- **Description:** Lists all quiz attempt records for the authenticated user.
- **Auth:** Required (`Bearer <JWT>`)
- **Response (200 OK):** `ApiResponse<QuizAttemptResultDto[]>`

### `GET /api/v1/users/me/overview`
- **Description:** Complete dashboard overview (total drugs tracked, quizzes completed, recent attempts).
- **Auth:** Required (`Bearer <JWT>`)
- **Response (200 OK):** `ApiResponse<UserOverviewDto>`

### `GET /api/v1/users/:userId/progress`
- **Description:** Access user progress by explicit userId. Strictly protected against IDOR.
- **Auth:** Required (must be resource owner or admin)
- **Errors:** `403 FORBIDDEN`

### `GET /api/v1/users/:userId/attempts`
- **Description:** Access user quiz attempts by explicit userId. Protected against IDOR.
- **Auth:** Required (must be resource owner or admin)
- **Errors:** `403 FORBIDDEN`

---

## 9. Administrative Portal (Admin-Only)

### `GET /api/v1/admin/`
- **Description:** Admin module status.
- **Auth:** Required (`role: admin`)
- **Errors:** `401 AUTHENTICATION_REQUIRED`, `403 FORBIDDEN`

### `GET /api/v1/admin/users`
- **Description:** Lists all registered users on the platform.
- **Auth:** Required (`role: admin`)
- **Rate Limit:** Admin Tier (30 requests / 5 min)
- **Response (200 OK):** `ApiResponse<AdminUserListItemDto[]>`

### `PATCH /api/v1/admin/users/:userId/role`
- **Description:** Elevates or demotes a user's role.
- **Auth:** Required (`role: admin`)
- **Rate Limit:** Admin Tier
- **Request Body:** `{ "role": "learner" | "admin" }`
- **Response (200 OK):** `ApiResponse<AdminUserListItemDto>`
- **Errors:** `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 RESOURCE_NOT_FOUND`

### `GET /api/v1/admin/metrics`
- **Description:** Real-time platform metrics (total users, attempts, progress records, role breakdown).
- **Auth:** Required (`role: admin`)
- **Response (200 OK):** `ApiResponse<PlatformMetricsDto>`

### `GET /api/v1/admin/users/:userId/progress`
- **Description:** Allows an administrator to inspect any user's progress.
- **Auth:** Required (`role: admin`)
- **Response (200 OK):** `ApiResponse<UserProgressDto[]>`
