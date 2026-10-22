# Drug Path Visualiser

An interactive, educational 3D web application designed to visualize and demystify the physiological journey of orally administered pharmaceuticals inside the human body.

---

## 1. Project Overview & Educational Mission

Understanding how medications travel through the body and exert therapeutic effects often requires navigating dense pharmacological jargon and static textbook diagrams. **Drug Path Visualiser** transforms this learning curve into an interactive, visual journey.

- **Target Audience:** General public and students (comprehension calibrated around Class 10–12 biology level).
- **MVP Drug:** **Ibuprofen** (400 mg oral tablet).
- **Core Experience:**
  - Interactive 3D abstract graph of physiological waypoints (Mouth $\rightarrow$ Stomach $\rightarrow$ Small Intestine $\rightarrow$ Liver $\rightarrow$ Bloodstream $\rightarrow$ Target Sites $\rightarrow$ Kidneys).
  - Real-time condition parameter toggle (**Before Food vs. After Food**) illustrating gastric delay and absorption dynamics.
  - Node inspection drawers detailing organ definitions, pathway roles, and clinical fun facts.
  - Diagnostic checkpoint quiz assessing pathway understanding with score persistence.

---

## 2. System Architecture

The application is structured as a **modular monolith** to balance simplicity, maintainability, and rapid integration:

```
[ Client Layer (Desktop / Tablet / Mobile) ]
                      │
                   [HTTPS]
                      ▼
[ React Frontend (TypeScript + Vite + React Three Fiber / Three.js) ]
  ├── 3D Anatomical Pathway Scene
  ├── Educational Content Panels & Drawers
  ├── Quiz & Assessment Module
  ├── Progress & Telemetry Dashboard
  └── Role-Based Admin Interface
                      │
              [REST API: JSON]
                      ▼
[ Node.js Backend (TypeScript - Modular Monolith) ]
  ├── Authentication Module (Google OAuth 2.0 / JWT)
  ├── Drug & Pathway Module (Nodes, Edges, Variations)
  ├── Content Module (Definitions, Roles, Fun Facts)
  ├── Quiz Module (Questions, Scoring, Rationales)
  ├── Progress Module (User attempts & history)
  └── Admin Module (Content management)
                      │
               [SQL Connection]
                      ▼
[ PostgreSQL Database (14-Table Relational Schema) ]
```

---

## 3. Team Responsibilities & Ownership (Team of 3)

The project is engineered collaboratively across three specialized roles working against shared contracts:

| Role | Member | Scope & Deliverables | Roadmap Range |
|---|---|---|---|
| **Frontend & 3D** | **Member 1** | React + TypeScript, Vite bootstrap, 3D pathway canvas (Three.js / React Three Fiber), node interaction, Before/After Food selector, responsive UI, Quiz UI. | **Tasks 01 – 10** |
| **Backend & Database** | **Member 2** | Node.js + TypeScript REST APIs, PostgreSQL schema & migrations, Google OAuth 2.0, server-side validation (Zod), RBAC, progress persistence. | **Tasks 11 – 20** |
| **Content, Quiz & QA** | **Member 3** | Curation of Ibuprofen pathway data, food condition variation profiles, quiz questions, API test suites, security testing (SQLi/XSS/RBAC), integration support. | **Tasks 21 – 30** |

---

## 4. Design System: BioLumen Pharmacology

The visual identity follows the **BioLumen Pharmacology** design system established from Google Stitch design specifications:

- **Theme:** Futuristic dark mode with glassmorphic cards and subtle luminous glow.
- **Color Palette:**
  - Background & Surface: `#0D141D` (Deep oceanic charcoal)
  - Card Containers: `#151C26` / `#19202A` / `#242A34`
  - Primary Accent: `#00E5FF` / `#00DAF3` (Luminous Cyan)
  - Secondary Accent: `#4EDEA3` (Biological Emerald)
  - Tertiary Accent: `#FFC589` (Warm Amber for Fed/Fasted callouts)
- **Typography:**
  - Display & Headings: `Plus Jakarta Sans` (Bold & Semi-Bold)
  - Body & Data Readouts: `Inter` (Regular & Medium)
- **Detailed Reference:** Full guidelines, tokens, and component rules are documented in [`docs/design/FRONTEND_DESIGN_GUIDELINES.md`](docs/design/FRONTEND_DESIGN_GUIDELINES.md).

---

## 5. Shared Local Environment Standards

To ensure zero integration friction between team members, all development runs on unified local ports:

| Service | Technology | Port / URL |
|---|---|---|
| **Frontend Web App** | Vite + React + TypeScript | `http://localhost:5173` |
| **Backend API Server** | Node.js + Express / Fastify | `http://localhost:3000` |
| **Relational Database** | PostgreSQL | `localhost:5432` |

---

## 6. Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ LTS recommended)
- [npm](https://www.npmjs.com/) (v9+)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) (v14+ for backend integration)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/darshsonsale/DrugVisualizer.git
   cd DrugVisualizer
   ```

2. **Check out the integration branch:**
   ```bash
   git checkout develop
   ```

3. **Configure Environment Variables:**
   Copy the example environment template to create your local `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Adjust database credentials and API endpoints as needed for your local machine. Never commit `.env` to Git).*

---

## 7. Git Workflow & Branching Conventions

- **Branch Structure:**
  - `main`: Production-ready, verified MVP code only. Direct commits and pushes to `main` are strictly forbidden.
  - `develop`: Primary integration branch where completed feature tasks are merged.
  - `feature/<name>`: Dedicated branches for specific roadmap tasks (e.g., `feature/frontend-bootstrap`, `feature/pathway-explorer`, `feature/backend-api`).
- **Commit Message Convention:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: <description>` (new feature)
  - `fix: <description>` (bug fix)
  - `docs: <description>` (documentation updates)
  - `refactor: <description>` (code refactoring without functional change)
  - `test: <description>` (test suites)
  - `chore: <description>` (tooling, dependencies, config)
- **Security Rule:** Never commit `.env` files, API keys, passwords, or secrets.

---

## 8. Workspace Directory Structure

```text
DrugVisualizer/
├── .git/                                                         # Git version control
├── .gitignore                                                    # Excludes dependencies, secrets, build artifacts
├── .env.example                                                  # Environment variables template
├── docker-compose.prod.yml.example                               # Production container template
├── nginx.conf.example                                            # Production reverse proxy template
├── README.md                                                     # Project documentation & run guide
├── Drug_Path_Visualiser_Professional_MVP_Implementation_Roadmap.pdf # Master implementation roadmap
├── frontend/                                                     # React + TypeScript + Three.js application
│   ├── Dockerfile                                                # Production multi-stage frontend Dockerfile
│   └── src/                                                      # UI components, 3D viewport, pages, services
├── backend/                                                      # Node.js + Express modular monolith backend
│   ├── Dockerfile                                                # Production multi-stage backend Dockerfile
│   └── src/                                                      # Modules: auth, drugs, content, quiz, progress, admin
└── docs/
    ├── deployment/                                               # Production deployment guides
    ├── operations/                                               # Monitoring, health checks, backup & recovery
    ├── release/                                                  # Release checklist and MVP release notes
    ├── testing/                                                  # E2E acceptance reports & defect logs
    ├── traceability/                                             # Requirement Traceability Matrix (Tasks 01-29)
    └── design/                                                   # Design tokens & BioLumen guidelines
```

---

## 9. Implementation Roadmap & MVP Completion Status

All 30 tasks defined in the master roadmap have been successfully implemented and verified:

| Range | Track | Owner | Status |
|---|---|---|---|
| **Tasks 01 – 10** | Frontend + 3D Visualization | Member 1 | **COMPLETED & VERIFIED** |
| **Tasks 11 – 20** | Backend + Database + APIs | Member 2 | **COMPLETED & VERIFIED** |
| **Tasks 21 – 30** | Content, Quiz, Security, Testing & Release | Member 3 | **COMPLETED & VERIFIED** |

### Key Checkpoints:
- ✅ **CP-01:** Frontend consumes real API responses.
- ✅ **CP-02:** Real 3D pathway appears in human anatomical viewport.
- ✅ **CP-03:** Before Food / After Food dynamic pharmacokinetics functional.
- ✅ **CP-04:** Checkpoint quiz submission & authoritative grading operational.
- ✅ **CP-05:** Authentication & progress persistence functional.
- ✅ **CP-06:** Administrative content management portal operational.
- ✅ **CP-07:** Master security, contract, integration, and E2E test suites pass (100%).
- ✅ **CP-08:** Production readiness, operational runbooks, and MVP Release approved (**v0.1.0-mvp**).

---

## 10. Operational & Verification Commands

```bash
# Frontend
npm run build         # Production Vite build (in frontend/)
npm run dev           # Development dev server (http://localhost:5174)

# Backend
npm run typecheck     # TypeScript verification (in backend/)
npm run build         # Production TypeScript build (in backend/)
npm run test:contract # Task 20 API contract verification (67 checks)
npm run test:security-suite # Task 26 security verification (177 checks)
npm run test:integration    # Task 27 database integration (97 checks)
npm run test:e2e      # Task 29 master E2E acceptance (57 checks)
npm run test:recovery # Task 30 backup & recovery verification (100% fidelity)
```

---

## 11. Production Documentation References

- [Production Deployment Guide](docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Operations and Monitoring Guide](docs/operations/OPERATIONS_AND_MONITORING_GUIDE.md)
- [PostgreSQL Backup & Recovery Runbook](docs/operations/BACKUP_AND_RECOVERY_RUNBOOK.md)
- [MVP Release Checklist](docs/release/MVP_RELEASE_CHECKLIST.md)
- [MVP Release Notes (v0.1.0-mvp)](docs/release/MVP_RELEASE_NOTES.md)
- [Requirement Traceability Matrix](docs/traceability/REQUIREMENT_TRACEABILITY_MATRIX.md)

---

## 12. License & Disclaimers

This project is an academic simulation created for educational and didactic purposes. It does not constitute formal medical diagnosis, clinical prescribing, or clinical advice.

