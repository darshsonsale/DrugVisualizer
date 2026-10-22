# Requirement Traceability Matrix (RTM) — Tasks 01 through 29

**Project:** Drug Path Visualiser — BioLumen
**Repository:** `D:\PROJECTS\DRUG PATH VISUALIZER`
**Baseline Document:** `Drug_Path_Visualiser_Professional_MVP_Implementation_Roadmap.pdf`
**Current Milestone:** Task 29 Acceptance

---

## 1. Traceability Overview

This matrix maps all core architectural requirements and acceptance criteria from the MVP Roadmap across Tasks 01 through 29 to the corresponding source code implementations, database entities, and test suites.

---

## 2. Requirement Mapping Table

| Req ID | Roadmap Task & Requirement | Implementation File(s) | Database Entity / Route | Verification Test(s) | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **REQ-01** | Repository & Environment Architecture | `backend/src/config/`, `frontend/vite.config.ts` | `.env.example`, `.gitignore` | `npm run build`, `npm run typecheck` | ✅ Verified |
| **REQ-02** | Frontend Bootstrap & BioLumen Design System | `frontend/src/App.tsx`, `frontend/src/index.css` | Light theme CSS variables, Material Symbols | Browser subagent, `landing_page.png` | ✅ Verified |
| **REQ-03** | 3D Anatomical Human Viewport | `frontend/src/components/canvas/`, `HumanSkeleton.tsx` | WebGL canvas, 3D anatomical nodes | `explore_page.png`, `pathway_viewer.png` | ✅ Verified |
| **REQ-04** | Anatomical Station Mapping (7 Stations) | `backend/src/database/seeds/0002_domain_data.ts` | `pathway_nodes` (Mouth to Kidneys) | `test:pathways`, `UC-01.2`, `UC-02.2` | ✅ Verified |
| **REQ-05** | Educational Station Inspection Cards | `frontend/src/components/explorer/StationInspector.tsx` | `node_content` (`general_description`, etc.) | `UC-02.1`, `E2E Flow 2` | ✅ Verified |
| **REQ-06** | Before Food / After Food Switcher | `frontend/src/components/explorer/RegimenToggle.tsx` | `pathway_variations`, `node_variations` | `test:condition-content`, `UC-03.2` | ✅ Verified |
| **REQ-07** | Four Supported Catalog Medicines | `backend/src/modules/drugs/`, `SUPPORTED_DRUGS` | `drugs` table (Ibuprofen, Amox, Amb, Insulin) | `test:contract` (Tests 4–13), `E2E Flow 1.2` | ✅ Verified |
| **REQ-08** | Subcutaneous Insulin Food Independence | `backend/src/database/seeds/0002_domain_data.ts` | $T_{\max} = 0.5\text{h}$ in both fasting & fed | `test:integration` (Suite 1), `E2E Flow 3.4` | ✅ Verified |
| **REQ-09** | Modular Monolith Backend Architecture | `backend/src/app.ts`, `backend/src/modules/` | Express routers: auth, drugs, content, quiz, progress | `test:contract` (All 67 tests) | ✅ Verified |
| **REQ-10** | PostgreSQL Relational Schema & Migrations | `backend/src/database/migrations/0001-0007` | 7 SQL migrations, pooled connections | `migrate:status`, `db:test` | ✅ Verified |
| **REQ-11** | Authoritative Server-Side Quiz Grading | `backend/src/modules/quiz/services/quiz.service.ts` | `POST /api/v1/quizzes/:id/attempts` | `UC-04.2`, `E2E Flow 4.4` | ✅ Verified |
| **REQ-12** | Answer Confidentiality Suppression | `backend/src/modules/quiz/controllers/quiz.controller.ts` | Omit `is_correct` in public quiz responses | `test:security-suite` (Suite 3), `E2E Flow 4.3` | ✅ Verified |
| **REQ-13** | Learning Progress Persistence | `backend/src/modules/progress/services/progress.service.ts`| `user_progress` table, `completed_nodes` | `UC-05.2`, `E2E Flow 5.2` | ✅ Verified |
| **REQ-14** | Personal Quiz History Isolation | `frontend/src/pages/ProgressPage.tsx`, `userService.ts` | `GET /api/v1/users/me/attempts` | `E2E Flow 5.4`, `E2E Flow 5.5` | ✅ Verified |
| **REQ-15** | Google OAuth 2.0 / OIDC Authentication | `backend/src/modules/auth/services/auth.service.ts` | `/api/v1/auth/google/url`, `openid, email, profile` | `UC-05.1`, `E2E Flow 6.1` | ✅ Verified |
| **REQ-16** | Local Credential Auth Fallback | `backend/src/modules/auth/services/auth.service.ts` | `/api/v1/auth/register`, `/api/v1/auth/login` | `E2E Flow 5.1`, `E2E Flow 7.1` | ✅ Verified |
| **REQ-17** | Administrator Content Management Portal | `frontend/src/pages/AdminContentPage.tsx`, `adminContent.service.ts`| `/api/v1/admin/content/*` | `UC-06.1`–`UC-06.4`, `E2E Flow 7` | ✅ Verified |
| **REQ-18** | Scientific Review Status Flagging | `backend/src/modules/admin/controllers/adminContent.controller.ts`| `review_status` in `node_content` | `E2E Flow 7.5`, `test:admin-content` | ✅ Verified |
| **REQ-19** | Graph Self-Loop & Topology Protection | `backend/src/modules/admin/services/adminContent.service.ts` | Validation: `from_node_id !== to_node_id` | `test:security-suite` (Suite 4) | ✅ Verified |
| **REQ-20** | OWASP Security Defenses & Rate Limiting | `backend/src/middleware/`, `helmet`, rate limiters | CSP, `nosniff`, `SAMEORIGIN`, HTTP 429 | `test:security-suite` (177 checks) | ✅ Verified |
| **REQ-21** | Database Safety & Isolated Test Automation | `backend/tests/api/integrationApiHelper.ts` | `drug_visualizer_test` dedicated database | `test:integration`, `test:e2e` | ✅ Verified |

---

## 3. Compliance Summary

- **Total Tracked Requirements:** 21
- **Fully Implemented:** 21 (100%)
- **Verified by Automated Suites:** 21 (100%)
- **Unmet Acceptance Criteria:** 0
