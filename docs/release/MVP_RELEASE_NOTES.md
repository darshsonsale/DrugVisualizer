# BioLumen — Drug Path Visualiser: MVP Release Notes (v0.1.0-mvp)

**Release Version:** `v0.1.0-mvp`  
**Release Date:** 2026-10-22  
**Milestone:** Task 30 — Production Readiness and MVP Release  
**Branch:** `develop` $\rightarrow$ Ready for `main`  
**Checkpoint:** **CP-08 (MVP Release Approved)**  

---

## 1. Executive Summary

We are pleased to announce the official release of **BioLumen — Drug Path Visualiser (MVP v0.1.0)**, an interactive, educational web application created to demystify human pharmacokinetics.

Built through 30 structured roadmap tasks, BioLumen integrates a React + Three.js 3D human anatomical explorer with an Express + TypeScript modular monolith backend and a PostgreSQL relational database.

---

## 2. Key Product Highlights

### 1. Interactive 3D Human Anatomical Explorer
- Abstract 3D human skeleton visualization created with Three.js and React Three Fiber.
- 7 core anatomical waypoints: Oral Cavity $\rightarrow$ Stomach $\rightarrow$ Small Intestine $\rightarrow$ Liver $\rightarrow$ Bloodstream $\rightarrow$ Target Sites $\rightarrow$ Kidneys.
- Interactive station selection revealing structured clinical descriptions, physiological mechanisms, defined terms, and patient key takeaways.

### 2. Real-Time Food Regimen Switching (Before Food vs After Food)
- Dynamic pharmacokinetic parameter updates illustrating gastric emptying delay.
- Baseline fasting $T_{\max} = 0.75\text{ hours} \rightarrow$ Fed $T_{\max} = 2.50\text{ hours}$ for Ibuprofen.
- Condition descriptions explain how food intake alters absorption kinetics without reducing cumulative therapeutic efficacy.

### 3. Expanded 4-Medicine Pharmacological Catalog
- **Ibuprofen (Oral NSAID tablet):** Prostaglandin inhibition, $t_{1/2} = 2.0\text{h}$, bioavailability = 88%.
- **Amoxicillin (Oral Beta-Lactam capsule):** Bacterial cell wall synthesis inhibition, $t_{1/2} = 1.0\text{h}$, bioavailability = 90%.
- **Ambroxol Hydrochloride (Oral Liquid syrup):** Mucokinetic surfactant stimulation, $t_{1/2} = 10.0\text{h}$, bioavailability = 75%.
- **Regular Human Insulin (Subcutaneous injection):** Cellular glucose uptake facilitation, demonstrating biological food-independence ($T_{\max} = 0.50\text{h}$ under both states).

### 4. Authoritative Server-Side Quiz Grading Engine
- Checkpoint assessment testing clinical comprehension.
- Evaluates attempts authoritatively on the backend, calculating verified scores and pass/fail status while preventing client tampering.
- Delivers structured scientific rationales and explanations for all questions.

### 5. Candidate Progress Tracking & History Persistence
- Instant display of completed quiz attempts on the Progress page without manual page reloads.
- Authenticated candidate progress persistence in PostgreSQL.
- Strict user data isolation: each candidate reviews only their own assessment history.

### 6. Administrative Content Portal & Peer Review
- Role-based administration portal (`/admin/content`) for clinical staff and pharmacologists.
- Real-time catalog summary metrics, node/edge inspection, takeaway updates, and scientific review status flagging (`FLAGGED_FOR_SCIENTIFIC_REVIEW`).
- Graph topology validation prevents invalid self-loops or broken pathway transitions.

---

## 3. Technology Stack Summary

- **Frontend:** React 18, TypeScript 5, Vite 6, Three.js, React Three Fiber.
- **Design System:** BioLumen Futuristic Healthcare Light Theme with high-contrast medical tokens.
- **Backend:** Node.js 20, TypeScript 5, Express 4 (Modular Monolith architecture).
- **Database:** PostgreSQL 14/15/16 with 7 migrations and atomic seeders.
- **Security & Quality:** OWASP headers, Zod validation, JWT authentication, Google OAuth 2.0 readiness, dual rate limiting, 100% test coverage across 398 automated checks.

---

## 4. Verification & Release Metrics

- **API Contract Tests (Task 20):** 67 / 67 PASSED.
- **Security Test Suite (Task 26):** 177 / 177 PASSED.
- **Integration Test Suite (Task 27):** 97 / 97 PASSED.
- **End-to-End Acceptance Suite (Task 29):** 57 / 57 PASSED.
- **Backup & Recovery Verification (Task 30):** 100% MATCH (PASSED).
- **Known Blocking Defects:** 0.

---

## 5. Deployment Quickstart

Refer to:
- `docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md` for containerized and VM deployment steps.
- `docs/operations/OPERATIONS_AND_MONITORING_GUIDE.md` for health checks and operational signals.
- `docs/operations/BACKUP_AND_RECOVERY_RUNBOOK.md` for backup schedules and disaster recovery.
