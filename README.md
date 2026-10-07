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
├── README.md                                                     # Project documentation & run guide
├── Drug_Path_Visualiser_Professional_MVP_Implementation_Roadmap.pdf # Master implementation roadmap
└── docs/
    └── design/
        ├── FRONTEND_DESIGN_GUIDELINES.md                         # Master design system & component rules
        └── stitch/                                               # Preserved Stitch design packages
            ├── stitch_drug_path_visualiser_web_app (2)/          # Home, Learn, Quiz, Progress references
            └── stitch_drug_path_visualiser_web_app (3)/          # 3D Pathway Explorer workspace reference
```

---

## 9. Implementation Roadmap & Progress

The MVP is delivered across 30 sequential tasks:

| Range | Track | Owner | Status |
|---|---|---|---|
| **Tasks 01 – 10** | Frontend + 3D Visualization | Member 1 | **In Progress** (Task 01 Completed) |
| **Tasks 11 – 20** | Backend + Database + APIs | Member 2 | *Planned* |
| **Tasks 21 – 30** | Content + Quiz + QA/Security | Member 3 | *Planned* |

### Member 1 Tasks (Frontend + 3D):
- [x] **Task 01:** Project Repository and Development Setup
- [ ] **Task 02:** Frontend Application Bootstrap (React + TypeScript + Vite)
- [ ] **Task 03:** Frontend Routing and Application Shell
- [ ] **Task 04:** Design System and Reusable UI Components
- [ ] **Task 05:** API Client and Frontend Data Layer
- [ ] **Task 06:** Pathway Explorer UI
- [ ] **Task 07:** Three.js / React Three Fiber Foundation
- [ ] **Task 08:** Interactive Pathway Graph
- [ ] **Task 09:** Food Condition Interaction
- [ ] **Task 10:** Frontend Integration and Responsive Polish

---

## 10. License & Disclaimers

This project is an academic simulation created for educational and didactic purposes. It does not constitute formal medical diagnosis, clinical prescribing, or clinical advice.
