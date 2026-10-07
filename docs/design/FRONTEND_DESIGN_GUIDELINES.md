# Frontend Design Guidelines & Visual Reference System

**Project:** Drug Path Visualiser  
**Role:** Member 1 — Frontend + 3D Visualization (Tasks 01–10)  
**Location of Visual References:** `docs/design/stitch/`  
**Status:** Approved Master Design Specification  

---

## 1. Source-of-Truth Hierarchy & Governance

When designing, scaffolding, and implementing the user interface for the Drug Path Visualiser, adhere strictly to this authority hierarchy:

```
MVP IMPLEMENTATION ROADMAP (PDF)
  │  Defines WHAT functionality, use cases, and acceptance criteria must be built.
  ▼
PROJECT ARCHITECTURE & TEAM RESPONSIBILITIES
  │  Defines HOW the system technically works (PostgreSQL, Node.js modular monolith, REST APIs).
  ▼
GOOGLE STITCH DESIGNS (docs/design/stitch/)
  │  Defines HOW the frontend should LOOK, FEEL, and ANIMATE (Theme: BioLumen Pharmacology).
  ▼
EXPLICIT PROJECT OWNER INSTRUCTIONS
     Provides task-by-task execution constraints and approvals.
```

*Rule: No source may silently override another source outside its assigned responsibility. In particular, the roadmap dictates functional scope, while Stitch dictates aesthetic execution.*

---

## 2. Complete Stitch Design Inventory

The workspace houses two extracted design reference packages under `docs/design/stitch/`:

### Package 1: `stitch_drug_path_visualiser_web_app (2)`
Contains four multi-screen spacious edition layouts and the BioLumen Pharmacology core design system token file:
1. `biolumen_pharmacology/DESIGN.md`: Core design tokens (color variables, font definitions, responsive breakpoints).
2. `home_drug_path_visualiser_spacious_edition/`: Landing & exploration launchpad (`code.html`, `screen.png`).
3. `learn_pharmacokinetics_knowledge_base_spacious_edition/`: Deep-dive educational knowledge base (`code.html`, `screen.png`).
4. `progress_user_learning_dashboard_spacious_edition/`: User telemetry & learning progress dashboard (`code.html`, `screen.png`).
5. `quiz_pathway_assessment_spacious_edition/`: Clinical quiz and interactive assessment interface (`code.html`, `screen.png`).

### Package 2: `stitch_drug_path_visualiser_web_app (3)`
Contains the primary 3D Pathway Explorer workspace:
1. `code.html`: Full markup and Tailwind config for the interactive explorer workspace.
2. `DESIGN.md`: BioLumen design token configuration.
3. `screen.png`: High-resolution visual capture of the 3D anatomical explorer, food condition toggle, node drawer, and transit timeline.

---

## 3. Screen-by-Screen Visual Analysis

### Screen 1: Home / Landing Launchpad (`home_drug_path_visualiser_spacious_edition`)
- **Screen Name:** Home — Drug Path Visualiser (Spacious Edition)
- **Purpose:** Public landing page introducing the application, conveying the educational mission, showcasing an embedded preview of the 3D anatomy, explaining core capabilities, and providing direct navigation routes to explore, learn, and test.
- **Overall Layout:** Centered, vertical single-column spacious layout (`max-w-7xl mx-auto px-6 lg:px-12`) with generous section breathing room (`gap-16` to `gap-24`).
- **Header / Navigation:** Fixed top navbar (`h-20`, `bg-surface/80`, `backdrop-blur-xl`, `border-b border-outline-variant/20`), containing:
  - Brand Logo: 36x36px rounded container (`bg-surface-container-high`, cyan medication icon, text: "Drug Path Visualiser").
  - Center Navigation Pills: `Home` (active pill), `Explore`, `Learn`, `Quiz`, `Progress`.
  - Right Utility: Search icon button, "Sign In" pill button, and user profile avatar icon.
- **Hero Section:**
  - Pill Sub-badge: "INTERACTIVE 3D PHARMACOKINETICS EXPERIENCE" (cyan dot + uppercase tracked typography).
  - Headline: "See the Journey of a Medicine Inside Your Body" (with "Inside Your Body" rendered in a glowing cyan gradient `#00daf3` $\rightarrow$ `#c3f5ff`).
  - Subtitle: "Trace how everyday medications like Ibuprofen travel from oral ingestion through biological barriers, bloodstream distribution, and receptor docking to deliver targeted relief."
  - CTA Button Group:
    - Primary CTA: "Explore 3D Pathway ↓" (solid cyan pill `bg-primary-container`, `text-on-primary-container`, drop shadow `shadow-[0_0_24px_rgba(0,229,255,0.35)]`).
    - Secondary CTA: "Start Learning" (translucent container pill `bg-surface-container-high`, `text-on-surface`).
- **3D Preview Frame / Showcase Card:**
  - Large floating cockpit card (`bg-surface-container-lowest/80`, border `border-outline-variant/30`, rounded-2xl) enclosing a futuristic human holographic figure with glowing anatomical nodes (Oral Cavity, Stomach, Liver, Hepatic Portal Vein, Bloodstream, Target Distribution).
  - Overlay Heads-Up Display (HUD): Status pill ("Simulation Active • Oral Route (Tablet)"), patient session tag box, and quick settings gear.
  - Bottom Frame Bar: "7 Key Anatomical Waypoints" summary with arrow link "Real-time Simulation $\rightarrow$".
  - Scroll indicator below card: "SCROLL DOWN TO EXPLORE PATHWAY $\vee$".
- **Capabilities Section ("Designed for Deep Anatomical Clarity"):**
  - Section Tag: "CORE CAPABILITIES".
  - 3-Column Grid (`grid-cols-1 md:grid-cols-3 gap-6`):
    1. Card 1: "Interactive 3D Visualisation" (cyan icon, description of rotating/zooming organ waypoints, action link "Explore 3D Nodes $\rightarrow$").
    2. Card 2: "Curated Pharmacokinetics" (emerald icon, explanation of ADME principles, action link "Read Bioavailability Docs $\rightarrow$").
    3. Card 3: "Interactive Assessment" (amber icon, checkpoint scenario quizzes, action link "Take Test Module $\rightarrow$").
- **Workflow Section ("How It Works"):**
  - Section Tag: "STRUCTURED WORKFLOW".
  - 3 Numbered Step Cards (`grid-cols-1 md:grid-cols-3 gap-6`):
    - Card 01: "01 Explore" (navigate 3D organ milestones).
    - Card 02: "02 Learn" (toggle Before Food / After Food to observe gastric delay curves).
    - Card 03: "03 Test" (complete quick diagnostic quizzes).
- **Academic Disclaimer Card:**
  - Full-width callout container (`bg-surface-container-low/70`, border `border-outline-variant/20`, rounded-xl) featuring cyan info icon and explicit notice that the application is for educational purposes and does not replace medical advice.
- **Footer:** Full-width dark footer with brand text and quick links ("Pathway Stages", "Bioavailability Docs", "Assessment Center").
- **States & Responsiveness:**
  - Desktop: Multi-column grids (`md:grid-cols-3`), spacious horizontal navbar.
  - Mobile: Navbar collapses to hamburger or bottom navigation; cards stack into a single column (`grid-cols-1`); hero typography scales from 36px to 26px (`headline-xl-mobile`).
  - Loading/Empty/Error states: *Not specified in Stitch reference.*

---

### Screen 2: Pathway Explorer (`stitch_drug_path_visualiser_web_app (3)`)
- **Screen Name:** Explore — Pathway Explorer Workspace
- **Purpose:** Primary functional screen for Member 1. Provides interactive 3D exploration of oral Ibuprofen transit, organ node selection, telemetry metrics, Before/After Food state toggling, node detail inspection, and overall timeline tracking.
- **Overall Layout:** Dense 3-column workstation layout:
  - Top: Drug header and global condition/telemetry control strip.
  - Center-Left: Vertical milestone selector list (`w-80` to `w-96`).
  - Center: Full 3D anatomical viewport canvas (`flex-1`).
  - Center-Right: Node information inspector drawer (`w-96`).
  - Bottom: Full-width horizontal pharmacokinetic progression timeline.
- **Header Control Strip:**
  - Left: Drug info badge with `HEVC` pill icon, title "Ibuprofen" (400 mg tag), subtitle "Oral Administration • Biopharmaceutics Class II".
  - Center: **Food Condition Selector**: Segmented pill switch `[ Before Food | After Food ]` (`bg-surface-container-lowest/80`, rounded-full, with active state highlighted in luminous cyan `bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(0,229,255,0.4)]`).
  - Right: Live telemetry readouts: "Absorption Index: 88.4%", "Estimated Tmax: 45 min".
- **Left Panel (Pathway Milestones):**
  - Title: "PATHWAY MILESTONES (1 of 7 Active)".
  - Vertical stack of 7 interactive milestone cards:
    1. Mouth (Ingestion & Wetting) — Active card with cyan badge `1` and forward arrow.
    2. Stomach (Disintegration pH 1.5–2).
    3. Small Intestine (Primary Absorption pH 6–7).
    4. Liver (Hepatic First Pass CYP2C9).
    5. Bloodstream (Systemic Distribution & Plasma).
    6. Target Sites (COX-1 & COX-2 Inhibition).
    7. Kidneys (Renal Clearance & Urine).
- **Center 3D Viewport:**
  - Canvas rendering the translucent anatomical human figure with glowing organ waypoints connected by a pulsing trajectory line.
  - Viewport HUD Overlays:
    - Top-Right telemetry: `FOV: 58° • ORTHO: OFF • SLICE: CORONAL T2`, `3D REALISTIC MODEL: ACTIVE`.
    - Bottom controls: 3D Orbit Rotate toggle, Zoom In/Out, Viewport Reset/Fullscreen, and "Auto-Transit" playback button (`bg-surface-container-high/80 rounded-full`).
- **Right Panel (Node Information Drawer):**
  - Header: "STAGE 1 OF 7" with previous `<` and next `>` stage navigation buttons.
  - Visual Media Card: "High-Magnification View" thumbnail of the active organ (mouth/tablet dissolution).
  - Title & Subtitle: "Mouth — Oral Cavity Ingestion & Deglutition".
  - Segmented Content Tabs: `[ Overview | Role | Fun Fact ]` (`bg-surface-container-high rounded-lg`).
  - Body Description: Curated pharmacological definition explaining tablet dissolution.
  - Physiological Metric Cards (2-column grid):
    - Salivary pH: `6.8 – 7.2`
    - Transit Time: `5 – 10 sec`
  - Primary Action Button: "Next: Stomach $\rightarrow$" (full-width solid cyan button).
  - Bottom Verification Card: "Mouth Stage Check (1 Question • Quick verify)" with "Verify" button.
- **Bottom Panel (Pharmacokinetic Timeline):**
  - Horizontal progress bar connecting all 7 anatomical stages (`Mouth 0-1m` $\rightarrow$ `Stomach ~30m` $\rightarrow$ `Intestine 1-2h` $\rightarrow$ `Liver 2-4h` $\rightarrow$ `Blood 4-6h` $\rightarrow$ `Target 6+h` $\rightarrow$ `Kidneys 12+h`).
  - Progress time readouts: "Elapsed: 00:00:08", "Remaining: ~5.5 hrs".
- **States & Responsiveness:**
  - Desktop: Full 3-column workstation layout.
  - Mobile/Tablet: Left milestone panel collapses into a dropdown or bottom sheet; right drawer docks as an overlay/slide-over bottom drawer; 3D viewport takes full screen height.
  - Loading/Error states: *Not specified in Stitch reference.*

---

### Screen 3: Learn / Knowledge Base (`learn_pharmacokinetics_knowledge_base_spacious_edition`)
- **Screen Name:** Learn — Pharmacokinetics Knowledge Base
- **Purpose:** In-depth educational reference page explaining Ibuprofen ADME concepts, molecular mechanism of action (COX-1/COX-2), the 7 physiological milestones with 3D inspection links, Before/After Food gastric emptying dynamics, and clinical FAQs.
- **Header Section:**
  - Badge: "PHARMACOKINETICS GUIDE • MOLECULAR ATLAS".
  - Headline: "How Does Ibuprofen Work?".
  - Subtitle: "A clean, didactic walkthrough of drug absorption, distribution, metabolism, and excretion (ADME) through human organ systems."
- **Key Metric Cards (4-column row):**
  1. Peak Time: `1.0 – 2.0 hrs` (Tmax oral plasma concentration).
  2. Protein Binding: `99%` (Albumin high affinity systemic carrier fraction).
  3. Plasma Elimination: `1.8 – 2.0 hrs` (Predictable clearance half-life t1/2).
  4. Enzyme Target: `COX-1 & COX-2` (Non-selective reversible inhibition).
- **Section 01: Molecular Bioenergetics:**
  - Split card:
    - Left: "Mechanism of Action: Stopping Pain at Its Source" narrative with two bullet callout pills ("Prostaglandin E2 Suppression", "Hypothalamic Reset").
    - Right: Visual card displaying 3D molecular binding rendering of Ibuprofen inside the COX-2 enzyme pocket.
- **Section 02: Pharmacokinetic Trajectory (7 Milestones):**
  - Section Tag: "02 PHARMACOKINETIC TRAJECTORY".
  - Vertical accordion/card list of the 7 stages (01 Oral Ingestion, 02 Gastric Disintegration, 03 Intestinal Absorption, 04 Hepatic First-Pass, 05 Systemic Circulation, 06 Target Site Action, 07 Renal Clearance).
  - Each milestone card includes stage number, organ name, duration window (e.g. `5 - 20 mins`), biological explanation, and an action button: "Inspect in 3D $\odot$".
- **Section 03: Before Food vs. After Food Dynamics:**
  - Section Tag: "03 GASTROINTESTINAL STATE COMPARISON".
  - Two side-by-side comparison cards:
    - Fasted State Card (Cyan lightning icon): "Accelerated Onset (~30 min)", unimpeded pyloric motility description, clinical note on mucosal contact.
    - Fed State Card (Emerald shield icon): "Buffered Transit (~60–90 min)", chyme retention description, clinical note on gastric cushioning.
- **Section 04: Clinical Inquiries & Pharmacodynamics (FAQ Accordion):**
  - Expandable accordion items for common clinical questions (e.g. chronic GI irritation, chiral inversion, protein binding drug interactions).
- **States & Responsiveness:**
  - Desktop: 4 metric columns, 2-column side-by-side comparison, full-width milestone list.
  - Mobile: Metrics wrap to 2x2 grid; comparison cards stack vertically; milestone cards stack description and button.

---

### Screen 4: Quiz / Assessment Interface (`quiz_pathway_assessment_spacious_edition`)
- **Screen Name:** Quiz — Pathway Assessment Console
- **Purpose:** Diagnostic testing interface where users take the Ibuprofen pathway assessment, select multiple-choice answers, track progress through a Question Matrix, view instantaneous proficiency analytics, and review flagged questions.
- **Top Header & Telemetry:**
  - Badge: "CLINICAL PHARMACOKINETICS EXAM".
  - Headline: "Ibuprofen Pathway Quiz".
  - Subtitle: "Assess your understanding of physiological transit and pharmacokinetics."
  - Right telemetry pills: Timer readout ("14:28") and Flagged count ("1 Flagged").
- **Progress Bar:**
  - Horizontal bar showing "Question 3 of 5", "60% Complete", and a glowing cyan fill track (`h-2`, `bg-primary-container`, `rounded-full`).
- **Two-Column Assessment Layout:**
  - **Left Panel (Main Question Card):**
    - Sub-badge: "STAGE 4 • HEPATIC PASSAGE", with a "Flag" button.
    - Question Text: "Which organ is primarily responsible for the first-pass metabolism and chiral inversion of orally administered Ibuprofen?" (`font-headline-lg`).
    - 4 Option Cards (A, B, C, D):
      - Inactive Option Card: Dark container (`bg-surface-container-low`), grey circle letter badge, organ name, explanation.
      - Active Selected Option Card: Glowing cyan border (`border border-primary-container`), cyan circular checkmark badge, "SELECTED" pill tag, vibrant text, drop shadow (`shadow-[0_0_20px_rgba(0,229,255,0.15)]`).
    - Didactic Insight Box: Explanatory card below options giving immediate scientific rationale ("DIDACTIC INSIGHT: CHIRAL KINETICS").
  - **Right Sidebar (Assessment Telemetry):**
    - Card 1: Question Matrix (`grid grid-cols-5 gap-2`):
      - Q1, Q2: Green check circles (Answered).
      - Q3: Cyan solid circle (Active).
      - Q4, Q5: Muted grey circles (Pending).
      - Legend: Answered (2), Active (1), Pending (2).
    - Card 2: Proficiency Gauge:
      - Circular Donut Gauge: `80% INDEX`, "Mastery High".
      - Concept competency bar: "First-Pass Metabolism Concept: Advanced".
    - Card 3: Study Refresher Box:
      - Graduation cap icon + external study link "Read Hepatic Clearance notes $\nearrow$".
- **Bottom Navigation Action Bar:**
  - Left: "Previous Question" button (`bg-surface-container-high`).
  - Center: "Review Flagged" button.
  - Right: "Next Question $\rightarrow$" primary cyan CTA button (`bg-primary-container text-on-primary-container`).

---

### Screen 5: Progress / User Learning Dashboard (`progress_user_learning_dashboard_spacious_edition`)
- **Screen Name:** Progress — User Learning & Mastery Dashboard
- **Purpose:** Displays authenticated or local session user learning telemetry, milestones traversed, quiz scores, earned achievement badges, Google Cloud OAuth account status, and retention velocity curve.
- **Top Header & Profile Badges:**
  - Badge: "CLINICAL TELEMETRY • PHASE I".
  - Headline: "Your Learning Progress & Mastery".
  - Subtitle: "Track your anatomical pathway exploration journey, quiz comprehension, and physiological milestones across drug pharmacokinetics."
  - Right identity badges: "CANDIDATE ID: PHARM-8842-X", "CLOUD SYNC: Synchronized" (green cloud icon).
- **Summary Metrics Row (4-column grid):**
  1. Trajectory Map Card: `6 / 7 Stages Traversed` with circular radial meter `86%`.
  2. Comprehension Card: `4 / 5 Correct` with badge `Proficient Evaluator` and 5 segment bars.
  3. Sim Immersion Card: `18 mins Volumetric Inspection • Active` (+4.2 mins vs baseline).
  4. Upcoming Phase Card: `STAGE 7 OF 7: Kidneys • Excretion` + CTA button "Resume Stage 7 $\rightarrow$".
- **Main Layout (Two Columns):**
  - **Left Column (Physiological Waypoints Trajectory):**
    - Section Header: "Physiological Waypoints Trajectory" with "6 of 7 Completed" badge.
    - Stack of Stage Cards:
      - Stages 01 to 06: Green circular check icon, stage number, organ name (e.g. "Oral Cavity • Dissolution"), biological notes, "100% Verified" label.
      - Stage 07 (Active Incomplete): Highlighted with cyan glowing border and gradient background, icon, description, and primary action button "Continue Learning: Kidneys $\rightarrow$".
  - **Right Column (Sidebar):**
    - Card 1: Earned Badges ("3 Acquired" badge):
      - Pathway Pioneer (Tier I — discovered initial 5 waypoints).
      - Gastric Guru (Tier II — mastered pH variability).
      - Enzyme Explorer (Tier II — analyzed CYP450 liver enzymes).
      - Pharmacokinetic Master (Locked state with padlock icon).
    - Card 2: Account & Security:
      - User Profile: Avatar image, User Name ("Dr. Aris Thorne"), Email, "OAuth 2.0 Active • Google Cloud Identity" status tag.
      - Details Table: Last Session Sync, Encrypted Telemetry (`AES-256 Enabled`), Device Authentication.
      - Action: "Force Synchronize Cache" button.
    - Card 3: Retention Velocity:
      - Smooth gradient sparkline/area curve plotted across Ingestion $\rightarrow$ Metabolism $\rightarrow$ Target Action $\rightarrow$ Excretion, tagged "+14% Growth".

---

## 4. Global Design System Specification

### 4.1 Color System
The color system strictly follows the Material 3 / BioLumen HSL palette defined in `DESIGN.md`:

| Token Name | Hex Value | Purpose / Usage |
|---|---|---|
| `surface` / `background` | `#0D141D` | Main canvas and page backdrop |
| `surface-dim` | `#0D141D` | Dimmed backdrop under modals / overlays |
| `surface-bright` | `#333A44` | Elevated borders and highlight accents |
| `surface-container-lowest` | `#080F18` | Deep recessed wells, viewport canvas background |
| `surface-container-low` | `#151C26` | Card backgrounds, drawer panels |
| `surface-container` | `#19202A` | Standard card surface, default container |
| `surface-container-high` | `#242A34` | Hover states, pill buttons, secondary inputs |
| `surface-container-highest`| `#2E353F` | Active borders, divider lines, muted pills |
| `on-surface` | `#DCE3F0` | High-contrast body text and headings |
| `on-surface-variant` | `#BAC9CC` | Secondary labels, descriptions, muted text |
| `outline` | `#849396` | High-visibility borders, active tab outlines |
| `outline-variant` | `#3B494C` | Subtle dividers, card borders (`rgba(59,73,76,0.4)`) |
| `primary` | `#C3F5FF` | Soft cyan text, accent highlights |
| `primary-container` | `#00E5FF` | Luminous cyan accent, primary CTA buttons, active pills |
| `primary-fixed-dim` / `surface-tint` | `#00DAF3` | Glowing neon borders, active radio states |
| `on-primary-container` | `#00626E` | Dark contrast text on luminous cyan buttons |
| `secondary` | `#4EDEA3` | Emerald green, biological waypoints, completed checks |
| `secondary-container` | `#00A572` | Emerald container, verified milestone pills |
| `on-secondary` | `#003824` | Text on secondary buttons |
| `tertiary` | `#FFE8D5` | Warm amber, Fasted vs Fed callouts |
| `tertiary-container` | `#FFC589` | Amber warning badges, highlight tags |
| `on-tertiary-container` | `#814C00` | Dark text on amber buttons |
| `error` | `#FFB4AB` | Error message text |
| `error-container` | `#93000A` | Error banners and validation fail boxes |

### 4.2 Typography System

The application uses two Google Fonts: **Plus Jakarta Sans** for display headings and brand titles, and **Inter** for dense data readouts, body paragraphs, and UI labels.

| Type Role | Font Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `headline-xl` | Plus Jakarta Sans | 36px | 700 (Bold) | 44px | -0.02em |
| `headline-xl-mobile`| Plus Jakarta Sans | 26px | 700 (Bold) | 32px | -0.01em |
| `headline-lg` | Plus Jakarta Sans | 24px | 600 (SemiBold) | 32px | -0.01em |
| `headline-md` | Plus Jakarta Sans | 18px | 600 (SemiBold) | 26px | 0 |
| `body-lg` | Inter | 16px | 400 (Regular) | 24px | 0 |
| `body-md` | Inter | 14px | 400 (Regular) | 20px | 0 |
| `body-sm` | Inter | 12px | 400 (Regular) | 18px | 0 |
| `label-lg` | Inter | 13px | 600 (SemiBold) | 16px | +0.02em |
| `label-md` | Inter | 11px | 600 (SemiBold) | 14px | +0.04em |
| `label-sm` | Inter | 10px | 700 (Bold) | 12px | +0.06em (Caps) |

### 4.3 Spacing, Grid & Border Radii
- **Spacing Scale:**
  - `space-xs`: `4px` (`0.25rem`)
  - `space-sm`: `8px` (`0.5rem`)
  - `space-md`: `16px` (`1rem`)
  - `space-lg`: `24px` (`1.5rem`)
  - `space-xl`: `32px` (`2rem`)
  - Container Max-Width: `1280px` (`max-w-7xl mx-auto`)
- **Border Radii:**
  - Badges & small pills: `4px` (`rounded-DEFAULT`)
  - Buttons & input fields: `8px` (`rounded-lg`)
  - Cards & container panels: `12px` to `16px` (`rounded-xl` / `rounded-2xl`)
  - Navigation tabs & toggle pills: `9999px` (`rounded-full`)
- **Shadows & Glow Effects:**
  - Card elevation: `shadow-xl`, `shadow-[0_1px_8px_rgba(0,0,0,0.04)]`
  - Neon Cyan Glow: `shadow-[0_0_16px_rgba(0,229,255,0.35)]`, `shadow-[0_0_24px_rgba(0,229,255,0.25)]`
  - Inset wells: `shadow-inner`

---

## 5. Responsive Design Behavior Across Viewports

| Viewport | Width | Layout Adaptation |
|---|---|---|
| **Desktop (xl / lg)** | $\ge 1024\text{px}$ | • Fixed top navbar with full horizontal pill links and user profile.<br>• 3-column Pathway Explorer (Milestones `w-80` \| 3D Viewport `flex-1` \| Info Drawer `w-96`).<br>• Multi-column grids for Knowledge Base and Dashboards (`grid-cols-3` or `grid-cols-4`). |
| **Tablet (md)** | $768\text{px} - 1023\text{px}$ | • Milestones panel collapses to a collapsible drawer or tab strip.<br>• 3D Viewport shares width with right-hand drawer (stacked vertically or toggleable tabs).<br>• Metric cards wrap to `grid-cols-2`.<br>• Navbar collapses search into an icon button. |
| **Mobile (sm / base)**| $< 768\text{px}$ | • Top navbar shrinks to brand icon, title, and hamburger/profile dropdown.<br>• Typography scales down (`headline-xl-mobile`: 26px).<br>• 3D Canvas occupies viewport height; Node Inspector appears as an expandable bottom sheet drawer.<br>• Buttons span full width (`w-full`).<br>• Quiz question choices and milestone cards stack vertically. |

---

## 6. 3D Visualization Design Direction

The Stitch reference establishes clear visual requirements for the 3D presentation:
1. **Abstract Educational Aesthetic:** Not hyper-photorealistic gore; rather, a sleek, luminous, holographic anatomical glass/wireframe shader in deep navy `#0D141D` with glowing cyan paths.
2. **Waypoints / Nodes:** Glowing spherical beacons at the 7 physiological organs (Mouth, Stomach, Small Intestine, Liver, Bloodstream, Target Sites, Kidneys).
3. **Connecting Edges:** Animated pulsing particle paths or glowing bezier curves representing drug transit.
4. **Food Condition Variation:** Switching between "Before Food" and "After Food" alters transit velocity, gastric dwelling time indicators, and absorption rate curves.
5. **Separation of Presentation & Science:** The 3D coordinates, camera rotation, and shaders reside purely in the frontend React Three Fiber layer; the database and API only supply logical node keys, roles, and variation definitions.

---

## 7. Mapping Stitch Screens to Roadmap Tasks 01–10

| Task ID | Roadmap Task Title | Relevant Stitch Screens | Key Visual Components to Implement | Design Rules to Follow |
|---|---|---|---|---|
| **Task 01** | Project Repository & Setup | All screens | Project documentation & reference structure | Organize design assets under `docs/design/`; maintain zero secret leaks. |
| **Task 02** | Frontend Bootstrap | All screens | HTML root template, Vite + React setup, font imports | Import `Plus Jakarta Sans` and `Inter`, configure CSS custom properties matching BioLumen tokens. |
| **Task 03** | Routing & Application Shell | Home, Explore, Learn, Quiz, Progress | Fixed Top Navbar (`h-20`), Brand Logo, Center Navigation Pills, Footer | Implement client-side routing (`/`, `/explore`, `/learn`, `/quiz`, `/progress`); active pill glow (`#00e5ff`). |
| **Task 04** | Design System & Reusable UI | All screens | Pill Buttons, Cards (`surface-container-low`), Badges, Accordions, Modal Drawers, Metric Boxes | Strictly enforce the BioLumen color palette, radii (`rounded-xl`), and hover transitions. |
| **Task 05** | API Client & Data Layer | Explorer, Quiz | State hooks, loading indicators, error banner states | Connect to backend REST endpoints; do NOT hardcode API data into visual components. |
| **Task 06** | Pathway Explorer UI | Screen 2 (`stitch (3)`) | 3-Column workspace layout, Drug Info Bar, Node Drawer, Milestone list | Faithful reproduction of Explorer grid, tabs `[Overview \| Role \| Fun Fact]`, timeline bar. |
| **Task 07** | Three.js / R3F Foundation | Screen 2, Screen 1 | Canvas viewport, OrbitControls, Camera HUD telemetry overlay | Dark scene background (`#080f18`), ambient/directional lighting, smooth responsive resizing. |
| **Task 08** | Interactive Pathway Graph | Screen 2 (`stitch (3)`) | 7 3D Nodes, connecting glowing trajectory edges, active selection glow | Clicking a 3D node synchronizes with Left Milestones list and Right Node Drawer. |
| **Task 09** | Food Condition Interaction | Screen 2, Screen 3 | Segmented pill toggle `[ Before Food \| After Food ]`, telemetry readouts | Toggle dynamically updates 3D transit parameters and drawer content based on API response. |
| **Task 10** | Frontend Polish & Responsive | All screens | Mobile drawers, tablet collapse, focus indicators, animations | Ensure accessible contrast, keyboard accessibility, smooth transitions, mobile responsiveness. |

---

## 8. Rules for New Screens or Missing Components

If a roadmap requirement specifies a feature not explicitly detailed in Stitch (e.g. detailed admin content management or specific error boundary fallbacks):
1. **Adhere to the BioLumen System:** Use `#0D141D` canvas background, `#151C26` / `#19202A` containers, `#00E5FF` primary accents, and `Plus Jakarta Sans` / `Inter` typography.
2. **Card Pattern:** Rounded corners (`12px` to `16px`), subtle border (`#3B494C` at 30% opacity), soft drop shadow.
3. **Button Pattern:** Primary action = luminous cyan pill with dark text; secondary action = dark container pill with white text.
4. **No Ad-Hoc Styling:** Never invent unvetted bright pastel colors or standard browser default styles.

---

## 9. The 12 Mandatory Frontend Implementation Rules

1. **Rule 1 — Inspect Stitch First:** Before implementing any frontend screen or component, inspect the corresponding Stitch screenshot and markup in `docs/design/stitch/`.
2. **Rule 2 — Match Visual Language:** Follow the Stitch aesthetic as closely as practical in layout, typography, colors, borders, and shadows.
3. **Rule 3 — Comprehensive Styling Match:** Faithfully preserve cards, buttons, pill badges, indicators, navigation, and panels.
4. **Rule 4 — Consistent Extension:** Components not present in Stitch must follow the exact same BioLumen design tokens.
5. **Rule 5 — No Blind Code Copying:** Never blindly copy and paste Stitch HTML into React components; translate markup into clean, modular, typed React components.
6. **Rule 6 — No Unvetted Dependencies:** Do not blindly install external packages from Stitch snippets.
7. **Rule 7 — Preserve Architecture:** Stitch's internal file layout must not override the modular React + TypeScript architecture.
8. **Rule 8 — No Generic UIs:** Avoid generic, unstyled dashboards. Maintain the premium dark-mode holographic science theme.
9. **Rule 9 — No Hardcoded Science:** Scientific content must flow dynamically from the data/API layer, never hardcoded from mockup placeholder text.
10. **Rule 10 — API as Source of Truth:** Backend models govern what data exists; frontend dictates presentation.
11. **Rule 11 — Separation of 3D Presentation:** 3D coordinates and camera rigs belong in the frontend presentation layer, not the database.
12. **Rule 12 — Document Deviations:** Any required divergence from the visual reference must be explicitly documented.
