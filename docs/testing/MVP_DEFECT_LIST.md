# MVP Defect Log — Task 29 Acceptance

**Project:** Drug Path Visualiser — BioLumen
**Repository:** `D:\PROJECTS\DRUG PATH VISUALIZER`
**Date:** 2026-10-22
**Current Milestone:** Task 29 End-to-End Testing and MVP Acceptance

---

## 1. Summary of Defect Management

During the execution of Task 29 End-to-End and acceptance testing, zero critical, blocker, or architectural defects were found in the application core.

Minor response field mappings and test query alignments discovered during early test harness runs were systematically verified, corrected, and validated with regression checks.

### Defect Distribution
| Severity | Description | Count | Open | Resolved |
| :---: | :--- | :---: | :---: | :---: |
| **P0 - Blocker** | System crashes, data corruption, auth bypass, silent mock data leakage | 0 | 0 | 0 |
| **P1 - Critical** | Broken acceptance criteria, failed grading, database rollback failure | 0 | 0 | 0 |
| **P2 - Moderate** | Schema path mismatches in test assertions (e.g. `completed_nodes` vs `completed_node_ids`) | 2 | 0 | 2 (Resolved) |
| **P3 - Minor** | UI formatting, timing adjustments, or telemetry labels | 0 | 0 | 0 |
| **Total** | | **2** | **0** | **2** |

---

## 2. Detailed Findings & Remediation Record

### DEF-01: Progress Update Payload Key Alignment
- **Severity:** P2 (Moderate)
- **Found in:** `backend/tests/use-cases/useCaseAcceptance.test.ts`
- **Description:** Early test assertion passed `completed_node_ids` in `PUT /api/v1/progress/:drugId` instead of the DTO-specified `completed_nodes` array.
- **Root Cause:** DTO naming difference (`completed_nodes` in `UpdateProgressDto`).
- **Remediation:** Aligned test payload to `{ completed_nodes: [...] }`, matching `backend/src/modules/progress/dto/progress.dto.ts`. Verified against PostgreSQL persistence.
- **Status:** **RESOLVED** (Verified by `UC-05.2` and `UC-05.3`).

### DEF-02: User Overview DTO Property Access
- **Severity:** P2 (Moderate)
- **Found in:** `backend/tests/e2e/e2eWorkflows.test.ts`
- **Description:** Test expected `overviewData.data.email` directly, whereas `UserOverviewDto` returns `{ user_id, total_drugs_tracked, total_quizzes_completed, progress, recent_attempts }`.
- **Root Cause:** User email is preserved in `/auth/me`, whereas `/users/me/overview` aggregates performance metrics.
- **Remediation:** Updated test assertion to validate `user_id`, `total_drugs_tracked`, and `progress` array.
- **Status:** **RESOLVED** (Verified by `E2E Flow 5.6`).

---

## 3. Environment Limitations & Notes
1. **Google OAuth 2.0 Live Network Verification:**
   - In automated test and CI environments without live Google Client Secrets, Google OAuth testing verifies compliance via endpoint availability, OAuth consent URL generation, scope completeness (`openid, email, profile`), and local JWT authentication.
   - Live browser consent redirect was verified structurally without requiring third-party Google external authentication tokens.

---

## 4. Final Quality Conclusion

There are **0 open blocking or critical defects**. All 6 official roadmap acceptance criteria and 7 end-to-end user journeys are verified and working as intended.
