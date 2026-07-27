---
name: ui-ux-designer
description: >
  Agente UI/UX Designer experto en revisión de diseño, usabilidad,
  accesibilidad y consistencia visual.
---

# UI/UX Designer Skill - BoliviaExperience (Modern Clean UI)

## Core Philosophy: Modern FinTech / Clean UI
Our mobile app UI follows a minimalist, high-contrast, card-based aesthetic (inspired by modern iOS/FinTech design standards like Wise, Revolut, and Airbnb).

### Key Visual Rules:
1. **High Contrast Surfaces:** Soft light gray backgrounds (`#F8F9FA` or `#FAFAFA`) paired with pure white cards (`#FFFFFF`) and dark primary elements.
2. **Generous Corner Radius:** Use `BorderRadius.circular(16.0)` or `20.0` for cards, inputs, buttons, and bottom sheets.
3. **Micro-Elevation & Soft Shadows:** Minimal borders. Use subtle, diffuse drop-shadows (`elevation: 1` or `BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: Offset(0, 4))`).
4. **Pill & Chip Styling:** Use rounded pills for category selections, filter chips, and rating badges.

---

## Official Design Tokens & Palette

- **Background Canvas:** `#FAFAFA` (App canvas / Scaffolds)
- **Surface / Cards:** `#FFFFFF` (Floating cards and containers)
- **Primary Accent / Headers / Main CTAs:** `#0F172A` (Navy/Dark Blue)
- **Vibrant Brand Accent / Active States:** `#10B981` (Emerald Green for switches, active pills, and success indicators)
- **Ratings & Badges:** `#F59E0B` (Warm Gold for star ratings)
- **Text Primary:** `#0F172A` | **Text Secondary:** `#64748B`
- **Border / Divider:** `#E2E8F0`

---

## Component Guidelines (Flutter)

### 1. Branding & Logo
- **App Name:** "BoliviaExperience" (Subtitle: "Santa Cruz de la Sierra").
- **Logo:** Always render the official diamond logo (`assets/images/app_icono.png`) inside a dark container (`#0F172A`) with rounded corners on Auth screens.

### 2. Form Inputs & Buttons
- **TextFields:** `OutlineInputBorder` with `borderRadius: 12.0`, border color `#E2E8F0`, and prefix icons.
- **Primary Button:** Height 52px, backgroundColor `#0F172A`, textColor White, `borderRadius: 12.0`.
- **Secondary / Action Chips:** Rounded pills (`BorderRadius.circular(24.0)`) using `#10B981` for active selection states.

### 3. Cards & Lists
- **Place Cards:** Hero thumbnail image, title in `#0F172A`, rating badge in warm gold (`#F59E0B`), and category chip in soft gray/emerald text.
- **Banners:** Use gradient containers from `#0F172A` to `#10B981` for callout cards (e.g., "Crea tu itinerario perfecto").

---

## Workflow & Sub-Module Integration
When executing UI/UX tasks, reference:
- Accessibility standards: `ux-accessibility.md`
- Consistency checks: `ux-check-consistency.md`
- Component reviews: `ux-review-component.md`
- Audits & Improvements: `ux-audit.md` and `ux-suggest-improvement.md`
