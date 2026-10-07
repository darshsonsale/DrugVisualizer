---
name: BioLumen Pharmacology
colors:
  surface: '#0d141d'
  surface-dim: '#0d141d'
  surface-bright: '#333a44'
  surface-container-lowest: '#080f18'
  surface-container-low: '#151c26'
  surface-container: '#19202a'
  surface-container-high: '#242a34'
  surface-container-highest: '#2e353f'
  on-surface: '#dce3f0'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dce3f0'
  inverse-on-surface: '#2a313b'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffe8d5'
  on-tertiary: '#492900'
  tertiary-container: '#ffc589'
  on-tertiary-container: '#814c00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcbc'
  tertiary-fixed-dim: '#ffb86b'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#683d00'
  background: '#0d141d'
  on-background: '#dce3f0'
  surface-variant: '#2e353f'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a cinematic, deeply immersive educational experience tailored for medical professionals, pharmacology students, and life science researchers. The atmosphere fuses scientific precision with volumetric lighting and futuristic bioluminescence. 

The aesthetic is anchored in Dark Glassmorphism balanced with Sci-Fi Scientific Precision:
- **Atmosphere:** Deep obsidian navy spatial environments reminiscent of high-end diagnostic tomography and advanced pharmacological simulation consoles.
- **Visual Depth:** Multi-tiered glass layers with translucent fills, edge-diffused spectral highlights, and targeted bioluminescent emission nodes that visually decode physiological processes.
- **Emotion:** Evokes awe, intellectual clarity, surgical focus, and absolute diagnostic confidence.

## Colors
The color palette relies on an oceanic void background elevated by distinct functional anatomical neon emitters. Every hue serves an educational and navigational role:

- **Primary (`#00e5ff` - Cyber Cyan):** Primary system focus, active trajectory vectors, pathway progression lines, active selections, and neuro/fluidic pathways.
- **Secondary (`#10b981` - Emerald Biolume):** Intestinal absorption phases, positive verification states, and enzymatic synthesis milestones.
- **Tertiary (`#ff9f1c` - Amber Glow):** Gastric disintegration, warnings, thermodynamic metabolic transitions, and renal clearance indicators.
- **Semantic Accents:**
  - *Hepatic Coral (`#f43f5e`):* Liver first-pass metabolism, target site interactions, and active tissue saturation.
  - *Vascular Violet (`#a855f7`):* Systemic blood circulation, molecular transport, and secondary metabolic pathways.
- **Neutrals & Surfaces:**
  - `Canvas Void`: `#050b14` (absolute background).
  - `Surface Low`: `#0b1324` with 60% opacity for primary panel structures.
  - `Surface High`: `#131f38` with 80% opacity for floating modals and inspectors.
  - `Border Tint`: `rgba(0, 229, 255, 0.18)` on active containers; `rgba(255, 255, 255, 0.08)` on inactive structures.
- **Text & Foreground:**
  - Primary Text: `#f1f5f9` (high legibility clinical contrast).
  - Secondary / Scientific Label: `#94a3b8`.
  - Muted / Inactive Meta: `#475569`.

## Typography
Typographic hierarchy pairs the modern geometric warmth of Plus Jakarta Sans for titles and dynamic stage callouts with the utilitarian neutrality of Inter for scientific body descriptions and tabular anatomical metadata.

- **Numbers and Milestones:** Numerical indicators in pathway steps utilize tabular figures to maintain vertical baseline rhythm across step navigators.
- **Uppercase Labels:** System status markers, micro-badges, and step identifiers employ `label-sm` or `label-md` with slight letter tracking (`0.04em` to `0.06em`) for surgical legibility against translucent backdrops.

## Layout & Spacing
The layout organizes high-density scientific visualization alongside telemetry controls and analytical sidebars:

- **Desktop (1200px+):** Tri-pane spatial layout. A dedicated vertical step selector occupies the left column (approx. 280px), the central visualization canvas spans fluidly across 6–7 columns, and contextual deep-dive inspectors or quiz components anchor the right 3–4 columns. The timeline spans the entire footer base.
- **Tablet (768px – 1199px):** Left step selector and visualizer stack vertically, while deep-dive inspect cards convert to overlay flyout drawers.
- **Mobile (< 768px):** Single-column layout. The pathway timeline converts to a horizontal swipeable step bar at the screen bottom, and the central anatomical viewport scales to 100vw with pinned floating badges.
- **Rhythm:** Built strictly on a 4px/8px sub-grid, ensuring data labels, organ pins, and glass boundary paddings consistently nest with `space-sm` and `space-md`.

## Elevation & Depth
Elevation is expressed through atmospheric luminescence, glass opacity tiers, and directional neon glow rather than standard drop shadows.

- **Level 0 (Canvas Base):** Solid deep-space gradient from `#050b14` to `#0a1128`.
- **Level 1 (Subordinate Containers & Timelines):** Fill `rgba(11, 19, 36, 0.65)`, backdrop-filter `blur(16px)`, border `1px solid rgba(255, 255, 255, 0.06)`.
- **Level 2 (Active Inspection Panels & Interactive Nodes):** Fill `rgba(15, 25, 48, 0.85)`, backdrop-filter `blur(24px)`, border `1px solid rgba(0, 229, 255, 0.25)`, ambient box-shadow `0 0 20px -4px rgba(0, 229, 255, 0.15)`.
- **Level 3 (Tooltips, Modals, Overlays):** Fill `rgba(10, 17, 40, 0.95)`, border `1px solid rgba(0, 229, 255, 0.45)`, dual glow shadow `0 8px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(0, 229, 255, 0.2)`.

## Shapes
A roundedness level of 2 (base 0.5rem / 8px) gives the interface a calibrated instrument feel that softens technical data without becoming overly toy-like.

- **Standard Cards & Inspectors:** `rounded-lg` (1rem / 16px) creates a polished, cohesive enclosure for complex anatomical imagery and nested metrics.
- **Pills & State Badges:** Segmented controls, timeline nodes, and step pins use pill-radius (`9999px`) to echo pharmaceutical capsules and cellular contours.
- **Input Fields & Dropdowns:** `rounded-md` (0.5rem / 8px) for crisp operational input fields.

## Components

### Buttons & Interactive Badges
- **Primary Action (e.g., "Start Quiz", "Next Stage"):** Filled pill with `#00e5ff` background, navy text (`#050b14`), font `label-lg`. Hover creates a radiant aura: `box-shadow: 0 0 16px rgba(0, 229, 255, 0.6)`.
- **Segmented Stage Selectors ("Before Food" / "After Food"):** Contained pill wrapper in `rgba(255,255,255,0.05)`. Active segment utilizes `#00e5ff` fill with stark navy text; inactive segment uses ghost styling with `#94a3b8` text.

### Interactive Stage Timeline & Anatomical Pins
- **Timeline Strip:** Horizontal track spanning the bottom viewport with illuminated vector paths connecting organ checkpoints. Checkpoints feature dual concentric glowing rings: an outer translucent halo matching the organ's accent hue (e.g., `#10b981` for Small Intestine) and a core colored node.
- **Organ Focus Badges (Overlay Markers):** Circular numeric badge (24px) paired with a high-contrast dark frosted tooltip containing the organ name and biological action (e.g., "Liver: First Pass Metabolism"). Active badges trigger a continuous subtle breathing glow (`0 0 12px currentColor`).

### Glass Cards & Inspectors
- **Hero Detail Inspector:** Pinned card framing organ macro-photography alongside micro-telemetry. Encased in `Surface High` glass with top-right step trackers ("Stage 1 of 7") and directional chevron buttons.
- **Metric Rows:** Flex rows featuring circular micro-icon containers with translucent backgrounds matching semantic colors, coupled with structured Key/Value typographic pairings.

### Lists & Dropdowns
- **Left Stage List:** Vertical list item cards with rounded-lg framing. Selected step applies a left-edge glowing accent rail in `#00e5ff`, a deep cyan background tint `rgba(0, 229, 255, 0.08)`, and an illuminated organ icon glyph.
- **Drug Selection Dropdown:** Pill/rounded-lg button holding medication icon, active molecule title, and mode of administration ("Oral Administration"). Trigger displays an interactive glow border on focus.