# ReadyLaunch Design Reference & Specification Analysis

Measured and inspected directly from https://readylaunch.framer.website/ (at 1440px desktop & 390px mobile viewport), aligned with the prompt tokens and structural guidelines.

---

## 1. Global Layout & Tokens

### Palette
- **Page Background (`--bg`)**: `#EFEFEF` (off-white soft background across all sections)
- **Primary Ink (`--ink`)**: `#0D0D0D` (headings, high-contrast text, primary CTA pill button)
- **Secondary Muted Text (`--text-muted`)**: `#575657` (body text, subtitles, captions, navigation links)
- **Cards & Surfaces (`--white`)**: `#FFFFFF` (pure white surface with subtle border)
- **Borders & Dividers**: `rgba(0, 0, 0, 0.06)` (cards and section containers), `rgba(0, 0, 0, 0.08)` (interactive secondary buttons)
- **Accent Pastels (strictly for soft backdrops, glows, tags, status dots - NEVER for big solid blocks)**:
  - `--sand`: `#D6C6A1`
  - `--green-1`: `#9FDA85`
  - `--green-2`: `#83DD79`
  - `--green-3`: `#85E378`
  - `--olive`: `#BED390`
  - `--purple`: `#7957EC`
  - `--pink`: `#D78FC6`
  - `--blue`: `#6E94CB`

### Typography Hierarchy
- **Primary Font**: Inter, system-ui, -apple-system, sans-serif
- **Mono Font**: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
- **Headings (H1 & H2)**:
  - Weight: `500` (medium)
  - Letter-spacing: `-0.03em`
  - Line-height: `1.05` to `1.1`
  - Desktop H1: `clamp(40px, 4.5vw, 64px)` (centered, balanced wrap)
  - Mobile H1: `34px - 36px`
  - Desktop H2: `clamp(28px, 3.2vw, 48px)` (centered)
  - Mobile H2: `26px - 30px`
- **Subtext / Paragraphs**:
  - Desktop: `16px - 18px`, line-height `1.5`, color `--text-muted` (`#575657`)
  - Mobile: `14px - 15px`, line-height `1.5`
- **Section Pill / Eyebrow**:
  - Size: `13px`, font-weight `500`, mono or medium sans
  - Padding: `6px 14px`, pill border-radius (`9999px`)
  - Background: `#FFFFFF`, border: `1px solid rgba(0, 0, 0, 0.08)`
  - Includes a subtle 14px icon + text

### Container & Spacing
- **Container Max-Width**: `1200px` (padded `24px` on desktop, `16px` on mobile)
- **Section Spacing**: `100px - 120px` vertical padding on desktop, `64px - 72px` on mobile
- **Card Radius**: `20px` (or `16px` on mobile inner cards)
- **Card Shadow**: `0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)`
- **Card Border**: `1px solid rgba(0, 0, 0, 0.06)`

### Buttons & Interactivity
- **Primary Button**: Solid `#0D0D0D`, text `#FFFFFF`, border-radius `9999px` (pill), padding `12px 24px`, font-size `14px`, font-weight `500`, smooth hover transition (`opacity: 0.9`, slight scale)
- **Secondary Button**: White `#FFFFFF`, text `#0D0D0D`, border `1px solid rgba(0, 0, 0, 0.1)`, border-radius `9999px`, padding `12px 24px`, hover background `#F5F5F5`

---

## 2. Section Breakdown & Behavior

### 1. Shell + Nav
- **Layout**: Floating navbar pinned to top, max-width `1100px`, margin `16px auto`
- **Style**: White `#FFFFFF` with `backdrop-filter: blur(12px)`, border `1px solid rgba(0, 0, 0, 0.08)`, border-radius `9999px` (pill), padding `10px 20px`
- **Left**: Forge logo mark + name ("Forge")
- **Center**: Nav links (Features -> `#features`, Engineering decisions -> `#decisions`, FAQ -> `#faq`, Security -> `#security`, GitHub -> repo in new tab)
- **Right**: Black pill "Get Started" (triggers guest sign-in)
- **Mobile**: Hamburger menu toggling a clean dropdown modal/drawer

### 2. Hero
- **Eyebrow**: Pill chip `13px` with subtle spark icon ("Deterministic Workflow Engine")
- **Headline**: "Workflows, dependencies and risk, enforced by default"
- **Subtext**: Forge eliminates release chaos with mathematically verified DAG dependencies, automated risk evaluation gates, and cryptographic auditability.
- **CTAs**: Primary "Get Started Free" (1-click guest auth) + Secondary "Explore Architecture" (`#decisions`)
- **Social Proof**: "Guaranteed cycle-free pipelines for mission-critical engineering"
- **Hero Mockup**: Large clean browser/canvas card (radius 20px) featuring the interactive workflow DAG with soft pastel background aura.

### 3. Features Bento (Productivity Features)
- **Eyebrow**: "Productivity Features"
- **H2**: "Made for how your team actually works."
- **Grid**: 4-card bento grid (2 columns on desktop, 1 on mobile).
  - Card 1: Live Dependency DAG & Blocker Detection
  - Card 2: Convex Reactive Real-Time Collaboration
  - Card 3: Multi-View Switching (Graph, Kanban, List, Audit)
  - Card 4: Automated Risk Scoring Engine

### 4. Key Capabilities (Sticky Split Section)
- **Layout**: Two columns on desktop.
- **Left Column**: Sticky list of 4 core capabilities:
  1. Deterministic Dependency Graphs
  2. Automated Gate Validation
  3. Real-Time Convex Sync
  4. Audit-Grade Traceability
- **Right Column**: Sticky card stack / pile displaying interactive visual cards with pastel gradient backdrops (`--green-1`, `--olive`, `--purple`, `--sand`).

### 5. Proof in the Numbers
- **Eyebrow**: "Proof In The Numbers"
- **H2**: "Built to scale, proven to perform."
- **Grid**: 4 clean metric cards with bold numbers (`48px - 56px`):
  - `100%` - Cycle-Free DAG Enforcement
  - `<15ms` - Reactive Mutation Latency
  - `0` - Unreviewed Critical State Bypasses
  - `99.99%` - Audit Log Fidelity

### 6. Handle Complex Workflows
- **Eyebrow**: "Engineered for Reliability"
- **H2**: "Handle complex workflows without the chaos."
- **Grid**: 3 cards horizontally on desktop with subtle pastel accents.

### 7. What's Included (No Pricing / No Tiers)
- **Eyebrow**: "Platform Capabilities"
- **H2**: "Everything included in every deployment."
- **Grid**: 3 comprehensive capability modules:
  - Core Workflow Engine
  - Team Orchestration & Gates
  - Enterprise Security & Audit

### 8. Roles Comparison Table
- **Eyebrow**: "Access & Governance"
- **H2**: "Roles comparison & permission matrix."
- **Table**: Clean comparison grid (Contributor vs Lead vs Admin) with clear checkmarks and permission descriptors.

### 9. Why Teams Choose Forge
- **Eyebrow**: "Why Teams Choose Forge"
- **H2**: "Boost clarity, speed, and governance."
- **Grid**: 6 cards in a 3x2 grid detailing operational advantages.

### 10. Engineering Decisions
- **Eyebrow**: "Architecture & Implementation"
- **H2**: "Engineering decisions that define Forge."
- **Cards**: Deep-dive technical decisions (Reactive Convex document store, client-side Tarjan cycle detection, declarative transition gate engine).

### 11. FAQ Accordion
- **Eyebrow**: "FAQ"
- **H2**: "Answers to help you get started faster."
- **Components**: 6 expandable FAQ rows with clean animated toggle carets.

### 12. Final CTA
- **H2**: "Ready to eliminate workflow chaos?"
- **Subtext**: "Launch an instant workspace or explore the architecture."
- **Buttons**: Primary "Launch Workspace" + "Read Docs"

### 13. Footer
- **Layout**: Clean grid with Forge logo, tagline, categorized navigation links, status indicator, and copyright.
