# Database Initialization, Migrations, and Seeding Guide

This guide describes the canonical, reproducible workflow for creating, migrating, seeding, and verifying the PostgreSQL database for the Drug Path Visualiser (BioLumen) platform.

---

## 1. Prerequisites

- **PostgreSQL 14+** running locally or in Docker on port `5432`.
- **Node.js 20+** and `npm` installed.
- **Environment Configuration**: Ensure `backend/.env` is configured with valid credentials:
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=drug_visualizer_dev
  DB_USER=postgres
  DB_PASSWORD=your_secure_password
  ```

---

## 2. Command Classifications & Execution Workflow

Commands are classified by their database mutation status to ensure developers and automated pipelines understand operational safety:

| Phase | Script / Command | Purpose | Mutation Status |
|---|---|---|---|
| **0. Pre-Flight Check** | `npm run db:check` | Verifies PostgreSQL connectivity and credentials. | **Read-Only / Safe** |
| **1. DB Creation** | `npm run db:create` | Creates `drug_visualizer_dev` if it does not already exist. | **Mutating (PostgreSQL DDL)** |
| **2. Migrations** | `npm run migrate:up` | Applies migrations 0001–0006 in sequential order. | **Mutating (Schema DDL)** |
| **3. Migration Status** | `npm run migrate:status` | Confirms all 6 migrations are applied with matching checksums. | **Read-Only / Safe** |
| **4. Seeding** | `npm run db:seed` | Idempotently populates 4 drugs, pathways, content, and quizzes. | **Mutating (Idempotent DML)** |
| **5. Seeder Verification** | `npm run test:seeder` | Programmatically verifies row counts, FKs, review flags. | **Read-Only / Safe** |
| **6. Regression Verification** | `npm run test:quiz-bank`<br>`npm run db:test:quiz`<br>`npm run test:api` | Verifies question banks, auth isolation, and HTTP endpoints. | **Read-Only / Rollback Safe** |

---

## 3. Step-by-Step Clean Setup Instructions

To provision a fresh development environment from scratch:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Check connection to PostgreSQL instance
npm run db:check

# 3. Create the database (if not already existing)
npm run db:create

# 4. Apply all schema migrations
npm run migrate:up

# 5. Verify migration status
npm run migrate:status

# 6. Execute repeatable seed
npm run db:seed

# 7. Run seeder verification suite
npm run test:seeder
```

---

## 4. Seeder Architecture & Guarantees

### A. Modular Structure
Seeders are located in `backend/src/database/seeds/`:
- [`drugSeeder.ts`](file:///d:/PROJECTS/DRUG%20PATH%20VISUALIZER/backend/src/database/seeds/drugSeeder.ts): Seeds core pharmacological metrics for Ibuprofen, Amoxicillin, Ambroxol, and Insulin.
- [`pathwaySeeder.ts`](file:///d:/PROJECTS/DRUG%20PATH%20VISUALIZER/backend/src/database/seeds/pathwaySeeder.ts): Seeds pathways, 3D camera stations, node content, condition variations (`BEFORE_FOOD` / `AFTER_FOOD`), and graph transitions.
- [`quizSeeder.ts`](file:///d:/PROJECTS/DRUG%20PATH%20VISUALIZER/backend/src/database/seeds/quizSeeder.ts): Seeds 20 questions and 80 options across all 4 medicines from `backend/data/quiz/question_bank.json`.
- [`index.ts`](file:///d:/PROJECTS/DRUG%20PATH%20VISUALIZER/backend/src/database/seeds/index.ts): Central coordinator managing topological execution order.

### B. Single-Transaction Boundary
All modular seeders receive the same `pg.PoolClient` and execute within an atomic transaction:
1. `BEGIN` transaction.
2. Seed drugs $\rightarrow$ pathways $\rightarrow$ variations $\rightarrow$ nodes $\rightarrow$ content $\rightarrow$ node variations $\rightarrow$ edges $\rightarrow$ quizzes.
3. Any failure triggers `ROLLBACK`, guaranteeing zero partial writes or state corruption.
4. Successful execution triggers `COMMIT`.

### C. Historical Quiz Immutability & Conflict Detection
To protect past student assessment records:
- Quizzes, questions, and options use `ON CONFLICT (id) DO NOTHING`. Existing question/option IDs, text, and correct answer mappings are never overwritten.
- Before inserting, `quizSeeder.ts` inspects existing database records against incoming fixtures. If a discrepancy is detected, a warning is logged (`[Quiz Seeder Warning] Fixture drift detected...`) while preserving the existing database record to prevent retroactively altering historical attempts.

### D. Scientific Provenance Flags
- All 24 node content records are flagged with `review_status = 'FLAGGED_FOR_SCIENTIFIC_REVIEW'`.
- All 80 quiz options are flagged with `needs_scientific_review = true`.
- Pharmacokinetic claims, food condition modifiers, and quiz explanations are traced to FDA NDAs, EMA SmPCs, or peer-reviewed literature.

---

## 5. Troubleshooting & FAQ

### Issue: `database "drug_visualizer_dev" does not exist`
**Resolution:** Run `npm run db:create` before running migrations or seeders.

### Issue: `SASL: SCRAM-SERVER-FIRST-MESSAGE` / Authentication Failed
**Resolution:** Verify that `DB_PASSWORD` in `backend/.env` matches your local PostgreSQL `postgres` user password.

### Issue: Foreign Key Violation during manual insertion
**Resolution:** Entities must be inserted in topological dependency order:
`drugs` $\rightarrow$ `pathways` $\rightarrow$ `pathway_nodes` $\rightarrow$ `node_content` / `node_variations` / `pathway_edges`. Always use `npm run db:seed` to ensure valid relational ordering.

### Issue: Safe Testing on an Isolated Database
To run seed verification against an isolated disposable database without touching development data:
```bash
# Set isolated test database name and run migration + seed test
TEST_DB_NAME=drug_visualizer_test_seed npm run test:seeder
```
