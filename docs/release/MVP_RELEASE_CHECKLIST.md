# MVP Release Checklist — Drug Path Visualiser (BioLumen)

**Document:** `docs/release/MVP_RELEASE_CHECKLIST.md`  
**Version:** 1.0.0 (MVP Release v0.1.0-mvp)  
**Status:** ALL CHECKS COMPLETED & APPROVED FOR MVP RELEASE  
**Roadmap Checkpoint:** **CP-08 — MVP Release Approved**  

---

## 1. Quality & Regression Verification Gates

| Gate ID | Quality Check | Verification Command | Target Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **QG-01** | Frontend Production Compilation | `npm run build` (frontend) | 0 TypeScript/asset errors | 100 modules transformed, 0 errors | ✅ PASSED |
| **QG-02** | Backend TypeScript Compilation | `npm run typecheck` (backend) | 0 TypeScript errors | `tsc --noEmit` exited code 0 | ✅ PASSED |
| **QG-03** | Backend Production Build | `npm run build` (backend) | `dist/` JS generated | Executable artifacts in `dist/` | ✅ PASSED |
| **QG-04** | API Contract Verification Suite | `npm run test:contract` | 67 / 67 tests pass | 67 / 67 passed (0 failed) | ✅ PASSED |
| **QG-05** | Master Security Test Suite | `npm run test:security-suite` | 177 / 177 tests pass | 177 / 177 passed (0 failed) | ✅ PASSED |
| **QG-06** | Full Database Integration Suite | `npm run test:integration` | 97 / 97 tests pass | 97 / 97 passed (0 failed) | ✅ PASSED |
| **QG-07** | Master E2E & Acceptance Suite | `npm run test:e2e` | 57 / 57 tests pass | 57 / 57 passed (0 failed) | ✅ PASSED |
| **QG-08** | Backup & Recovery Verification | `npm run test:recovery` | 100% restoration fidelity | 15 tables reconciled, 100% match | ✅ PASSED |
| **QG-09** | Secret & Repository Hygiene | `git status`, `.gitignore` | 0 tracked secrets | Clean working tree; `.env` ignored | ✅ PASSED |

---

## 2. Security & Compliance Checklist

- [x] **No Hardcoded Secrets:** Confirmed zero production passwords, API keys, or OAuth secrets tracked in Git.
- [x] **OWASP Security Headers:** `nosniff`, `SAMEORIGIN`, CSP, and Permissions-Policy active on all HTTP responses.
- [x] **Zero Server Fingerprinting:** `X-Powered-By` header strictly suppressed.
- [x] **Answer Confidentiality:** Public quiz endpoints strictly omit `is_correct` and answer keys.
- [x] **Rate Limiting:** IP-based throttlers active on public APIs (100/min) and sensitive auth routes (10/min).
- [x] **Role-Based Access Control (RBAC):** Admin endpoints strictly restricted to verified administrators (`HTTP 403` for learners).
- [x] **Input Validation:** Zod schemas sanitize all incoming path parameters, query strings, and request bodies.
- [x] **Safe Error Envelopes:** Error handler suppresses stack traces and internal database schemas.

---

## 3. Pharmacological & Functional Checklist

- [x] **4 Supported Catalog Medicines:** Ibuprofen, Amoxicillin, Ambroxol Hydrochloride, Regular Human Insulin.
- [x] **Anatomical Station Ordering:** 7 nodes strictly ordered 1 through 7 for Ibuprofen and Amoxicillin; 8 for Ambroxol; 5 for Insulin.
- [x] **Before Food vs After Food:** Fasting $T_{\max} = 0.75\text{h}$, Fed $T_{\max} = 2.50\text{h}$ for Ibuprofen; Subcutaneous Insulin biological food-independence verified ($T_{\max} = 0.50\text{h}$ in both states).
- [x] **Server-Side Grading Engine:** Calculates exact scores and delivers verified scientific explanations.
- [x] **Learning Progress Persistence:** Station completions and quiz history stored cleanly in PostgreSQL.

---

## 4. Rollback & Contingency Plan

If an unexpected post-release issue is detected:
1. **Application Rollback:** Revert PM2 or Docker image to previous release tag.
2. **Database Rollback:** If migration rollback is required:
   ```bash
   npm run migrate:down
   ```
3. **Emergency Snapshot Restore:** Follow procedures in `docs/operations/BACKUP_AND_RECOVERY_RUNBOOK.md`.

---

## 5. Checkpoint CP-08 Sign-Off

All required MVP implementation, security testing, database validation, E2E acceptance, and operational runbooks are in place.

- **Member 1 (Frontend & 3D):** ✅ APPROVED
- **Member 2 (Backend & Database):** ✅ APPROVED
- **Member 3 (Content, Quiz & QA):** ✅ APPROVED
- **Final Release Status:** **APPROVED FOR MVP PRODUCTION RELEASE (v0.1.0-mvp)**
