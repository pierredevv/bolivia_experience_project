cat << 'EOF' > .agents/skills/frontend-design/SKILL.md
---
name: "bolivia_experience_design_system"
description: "Strict production-grade UI/UX architecture and Tailwind CSS token specifications for BoliviaExperience (B2C Tourist Platform & B2B Merchant/Admin Dashboards)."
---

# Front-End Design System & UI Architecture

This document serves as the absolute source of truth for all generative UI tasks, front-end refactoring, and component design within the `bolivia_experience_project`. All agents MUST enforce these structural ratios, semantic color systems, and behavioral heuristics to guarantee a premium, high-converting enterprise platform.

---

## 📐 1. Visual Style Architecture (Ratios & Design Language)

Every view, layout, and component must adhere strictly to the following composition formula:

### A. 70% Alpine & Andean Minimalism 🏔️ (Inspiration: Apple / Airbnb)
*   **Whitespace & Layout Density:** Enforce radical breathing room. Utilize expansive utility padding and structural gaps (`space-y-12`, `md:gap-8`, `p-8`, `lg:p-12`) to eliminate visual clutter. 
*   **Typography Hierarchy:** Large, high-contrast, elegant headers using deep tracking and tight leading (`text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none`).
*   **Navigation & Cognitive Load:** Keep layouts distraction-free. Limit immediate visible interactions to primary workflows, offloading secondary features to intuitive disclosure widgets or context menus.

### B. 15% Material Design 3 Functional Ergonomics 📱 (Inspiration: Google Business)
*   **Surface Elevation:** Define clear interactive surfaces. Use micro-borders instead of heavy shadows to represent container states (`bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300`).
*   **Forms & Inputs:** Implement highly accessible form fields with explicit focus states, clear helper text, and error boundaries (`focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 rounded-2xl transition-all`).

### C. 10% Cinematic Glassmorphism 🪟 (Inspiration: Stripe)
*   **Permitted Use Cases:** Restrict glassmorphism exclusively to high-impact focal points—specifically: persistent sidebars, fixed admin headers, floating search engines positioned over landscape hero sections, and immersive modal wrappers.
*   **Tailwind Architecture:** Containers must blend backdrop blur filters with semi-transparent matching borders to simulate real refraction: `bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-900/5`.

### D. 5% Organic & Geographic Softness 🌿
*   **Corner Radii:** Strictly forbid harsh, sharp 90-degree corners on card structures, modals, and input fields. Use organic, sweeping roundness (`rounded-3xl` or `rounded-2xl`) to mirror natural landscape curves.
*   **Media Integration:** Large, high-definition photography wrappers featuring Bolivian landmarks, styled with smooth entry transitions and subtle scale animations (`overflow-hidden hover:scale-[1.02] transition-transform duration-500`).

---

## 🎨 2. Semantic Token System (Tailwind CSS Mapping)

Do not use arbitrary colors. All interfaces must compile directly into this curated emotional palette:

| Design Token | Semantic Meaning | Tailwind Utility | Emotional & Psychological Impact |
| :--- | :--- | :--- | :--- |
| **Primary Blue** | Trust & Technology | `bg-blue-600`, `text-slate-900` | Instills corporate maturity, platform security, and seriousness. |
| **Secondary Green** | Nature & Living Tourism | `bg-emerald-600`, `text-emerald-700` | Reflects eco-tourism, fresh discoveries, and vibrant local life. |
| **Accent Gold** | High-Value Conversion / CTA | `bg-amber-500`, `hover:bg-amber-600` | Drives focus to monetization points, registration buttons, and primary actions. |
| **Base White** | Canvas Purity | `bg-white` | Delivers the high-end minimalist cleanliness of premium global apps. |
| **Surface Gray** | Optimal Readability Baseline | `bg-slate-50/50` | Low-contrast background tone that reduces eye strain and emphasizes cards. |

---

## 🛠️ 3. Standard Interactive UI Components

### A. Immersive Search & Budget Estimator (Glassmorphic + Slider Context)
```html
<div class="w-full max-w-5xl bg-white/75 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/60 shadow-2xl shadow-slate-900/10 flex flex-col md:flex-row gap-6 items-center transition-all duration-300">
  <!-- Destination Input -->
  <div class="flex-1 w-full">
    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Where to next?</label>
    <input type="text" placeholder="e.g., Uyuni, Madidi, Samaipata..." class="w-full bg-transparent text-slate-900 font-semibold text-lg placeholder-slate-400 outline-none border-b border-transparent focus:border-slate-200 pb-1 transition-all" />
  </div>
  
  <!-- Dynamic Budget Slider (Bs.) -->
  <div class="w-full md:w-56">
    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Max Budget (Bs.)</label>
    <div class="flex items-center gap-3">
      <input type="range" min="50" max="5000" step="50" class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
    </div>
  </div>

  <!-- Primary CTA Button (Gold Token) -->
  <button class="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transform hover:-translate-y-0.5 whitespace-nowrap">
    Discover Adventure
  </button>
</div>

---

## 📊 4. Enterprise & B2B Dashboard Layout Architecture (Admin Panels)

When generating dashboard layouts, views, analytics charts, or table components for merchants/businesses, agents MUST follow this technical layout standard:

### A. Sidebar & Layout Navigation (10% Cinematic Glassmorphic Blur)
*   **Structure:** Persistent vertical sidebar with an ultra-clean layout. Use `bg-slate-900 text-white` or `bg-white/75 backdrop-blur-xl border-r border-slate-200/60`.
*   **Active Item Tokens:** Active routes must not use sharp block fills. Use a soft organic background wrapper with precise text highlights: `bg-emerald-500/10 text-emerald-700 rounded-2xl font-black`.

### B. Workspace Canvas & Metric Cards (15% MD3 Functional Layout)
*   **Canvas Background:** Strictly employ the low-contrast readability baseline `bg-slate-50/50`.
*   **Bento Grid Elements:** Metric grids must be modular and asymmetric (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`).
*   **Card Architecture:** White crisp canvas surfaces with smooth organic curves and subtle borders: `bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300`. 

### C. Large Hero Brand Banners (5% Organic Landscape Approach)
*   **Restructuring Heavy Fills:** Replace solid saturated color block headers (like your current flat orange banner) with a minimalist text box or an elegant deep tone combined with blurred contextual accent drops or subtle brand gradients (`bg-gradient-to-r from-slate-900 to-slate-950 rounded-[2.5rem]`).
*   **Typography:** Maintain the absolute header standard: `text-3xl sm:text-4xl font-black tracking-tight text-white`.