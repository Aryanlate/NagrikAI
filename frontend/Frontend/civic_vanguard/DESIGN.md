---
name: Civic Vanguard
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444653'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#003d28'
  on-tertiary: '#ffffff'
  tertiary-container: '#00563a'
  on-tertiary-container: '#5bcf9e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system operates under an ethos of institutional transparency, accountability, and approachable civic stewardship. The interface serves two primary audiences simultaneously: citizens who require dignity, simplicity, and swift assurance during distressing civic issues, and municipal operators who navigate high-density triage workloads requiring extreme cognitive clarity.

The visual style embraces a modern **Corporate / Institutional Structured** framework with humanist touches. It rejects both the sterile, outdated aesthetic of legacy government portals and the overly playful, non-serious tropes of consumer social apps. Visual weight is maintained through disciplined structural grids, reassuring deep blues, and instant status comprehension via functional chromatic tokens. Surfaces are purposeful and clean, communicating operational excellence, statutory compliance, and immediate responsiveness.

## Colors
The palette leverages a hierarchy rooted in authority, utility, and immediate semantic signaling:

- **Primary (`#1E40AF` & `#2563EB`):** Civic Navy and Royal Blue project institutional stability, authority, and confidence. Used for primary navigation, critical interactive controls, and confirmed states.
- **Secondary (`#0284C7` & `#38BDF8`):** Cobalt and Cyan accents serve as contextual telemetry—active filters, interactive tooltips, data highlights, and citizen intake accents.
- **Functional SLA Palette:** 
  - **Resolved / On-Track:** Forest Emerald (`#059669` text/stroke on `#D1FAE5` surface) for resolved issues or timelines operating within standard bounds.
  - **Approaching SLA:** Warm Amber (`#D97706` text/stroke on `#FEF3C7` surface) for impending deadlines and citizen follow-up nudges.
  - **Breached / Escalated:** Crimson (`#DC2626` text/stroke on `#FEE2E2` surface) strictly reserved for statutory breaches, citizen grievances requiring urgent oversight, and hard blockers.
- **Neutrals (`#0F172A`, `#334155`, `#64748B`, `#F8FAFC`):** Deep slate provides crisp typography contrast against pure whites and subtle cool background washes, eliminating eye strain across prolonged administrative shifts while adhering to WCAG 2.1 AAA contrast targets for all textual content.

## Typography
`Plus Jakarta Sans` governs all view layers. Its geometric structure yields high optical clarity across dense civic data grids, yet its humanist apertures preserve empathy in citizen conversational flows.

- **Headlines & Display:** Set tight with subtle negative tracking (`-0.02em` to `-0.01em`) to maintain editorial discipline and executive authority on analytical dashboards.
- **Body Text:** Ample line-height ensures sustained legibility across lengthy citizen incident reports, legal bylaws, and municipal resolution audit logs.
- **Labels & Data Points:** Capitalized or tabular-numeric formatting applied to ticket identifiers (e.g., `#BLR-2024-901`), SLA countdown timers, and micro-status indicators for rapid scanning.

## Layout & Spacing
The layout model employs a fluid 12-column grid system optimized for complex desktop administration screens, with responsive condensation down to 8 columns on tablet and 4 columns on mobile.

- **Desktop (1024px+):** Fixed standard margin of `2rem` with a `1.5rem` gutter. Data density is prioritized; administrative consoles utilize a fixed left rail (compact or expanded), a flexible central operations canvas, and an optional sliding contextual detail drawer.
- **Tablet (768px - 1023px):** Margin adjusts to `1.5rem` and gutters down to `1rem`. Secondary analytical cards collapse from multi-column rows into 2x2 stacked grids.
- **Mobile (< 768px):** Outer margin is set to `1rem` with `space-sm` or `space-md` gaps. Complex tables reflow into progressive disclosure card stacks; multi-action toolbars consolidate into pinned bottom action bars.
- **Spacing Scale:** Built on a disciplined 4px/8px modular cadence. Component internals leverage `space-xs` and `space-sm` to maintain data proximity, while section containers and cards rely on `space-lg` and `space-xl` to prevent cognitive fatigue.

## Elevation & Depth
Elevation is achieved primarily through **Tonal Layers** supplemented with **Low-Contrast Outlines** and highly restrained ambient shadows, avoiding superficial visual gimmickry.

- **Base Layer:** The global foundation uses `#F8FAFC` (Slate 50). Workspaces, background canvases, and split panes rest here.
- **Surface Elevation 1 (Cards, Modules, Table Rows):** `#FFFFFF` surfaces bounded by a hairline border (`1px solid #E2E8F0`). Subtle downward ambient drop shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05)`.
- **Surface Elevation 2 (Dropdowns, Popovers, Filter Menus):** Pure white container floating with an intentional soft drop: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`, edged with `#CBD5E1`.
- **Surface Elevation 3 (Citizen Intake Modals, Critical Overlays):** Centralized overlay supported by a backdrop blur (`backdrop-filter: blur(4px)`) tinted with `rgba(15, 23, 42, 0.45)`, with a deep focal drop shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12)`.

## Shapes
A "Soft" roundedness (`0.25rem` standard / `4px`) underpins this design system. It reflects technical efficiency and organizational precision.

- **Inputs, Buttons, and Table Components:** Use base `0.25rem` (4px) radii. This maintains sharp, unambiguous boundaries essential for dense alignment and tabular scans.
- **Content Cards & KPI Blocks:** Utilize `rounded-lg` (`0.5rem` / 8px) to cleanly distinguish discrete informational domains without feeling bubbly.
- **Overlays, Floating Action Sheets, & Chat Shells:** Bound by `rounded-xl` (`0.75rem` / 12px) to softly transition contextual floating panels over structured data backdrops.
- **Interactive Badges & Pills:** Full pill rounding (`9999px`) is reserved solely for status tags and categorical indicator chips to distinguish actionable or telemetry data from boxy interaction controls.

## Components

### Buttons
- **Primary:** Solid `#1E40AF` fill with white text, 40px height for administrative actions (36px in compact tables), 48px for citizen intake. Hover transitions to `#1D4ED8`. Focus state displays an outer 2px ring in `#38BDF8` with a 2px offset.
- **Secondary / Outlined:** Transparent background, `1px solid #CBD5E1`, text in `#334155`. Hover shifts background to `#F1F5F9`.
- **Destructive:** Solid `#DC2626` or outlined with `#DC2626` text and border; reserved strictly for rejecting complaints, terminating SLAs, or issuing formal municipal alerts.

### Interactive Status Badges & SLA Indicators
- Constructed as compact, pill-shaped tags (`rounded-full`, 24px height, uppercase label-sm typography).
- **On Track:** `#D1FAE5` background, `#065F46` label, paired with an emerald static dot.
- **Approaching SLA:** `#FEF3C7` background, `#92400E` label, accompanied by a pulsing amber dot.
- **Breached / Escalated:** `#FEE2E2` background, `#991B1B` label, featuring an alert icon prefix. Hover triggers a contextual popover revealing exact hours remaining or breached supervisor logs.

### Data Tables
- **Header:** Sticky positioning, `#F8FAFC` surface, uppercase `label-sm` in `#64748B`, with integrated arrow indicators for multi-column sorting.
- **Rows:** Zebra striping is avoided; instead, use standard white rows with 1px `#F1F5F9` bottom separators. Hover state triggers a complete row tint of `#F8FAFC` with a left border highlight of 3px in `#2563EB`.
- **Density:** Compact row spacing (44px) ensures dense visibility of citizen IDs, categories, assignees, dates, and SLA states.

### Step Progression Cards
- Used for citizen complaint lifecycles (e.g., *Submitted → Verified → Field Inspection → Resolution in Progress → Citizen Sign-off*).
- Connected horizontally via a 2px track. Completed stages feature solid `#1E40AF` circular nodes with white checkmark icons; active stages show an outlined `#2563EB` node with an internal glowing core; pending steps remain muted slate (`#CBD5E1`).

### Chat Bubble Follow-ups & AI Triage
- **Citizen / Operator Bubbles:** Clean white card, `rounded-lg`, aligned right for staff responses, left for citizen communications.
- **System / AI Audit Node:** Full-width micro-banner centered in the chat stream with a subtle secondary tint (`#F0F9FF`), `#0284C7` hairline border, and a distinct robotic/verification glyph illustrating automated summarization or dispatch.

### KPI Stat Cards
- Enclosed in `rounded-lg` containers with `space-md` padding. Displays a prominent headline-md metric, a supporting label-md descriptor, and an embedded trend delta indicator (e.g., `+12.4% resolution speed vs last week`) rendered in corresponding semantic colors.