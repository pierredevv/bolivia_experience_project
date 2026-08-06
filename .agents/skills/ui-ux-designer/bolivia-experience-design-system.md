# BoliviaExperience - Official Design System & UI Rules

### 1. Brand Identity & Palette (Web & Mobile)
- **Primary / Dark Accent:** Navy/Dark Blue `#0F172A` (Usar para Headers, AppBars, botones primarios y fondos destacados).
- **Vibrant Accent:** Emerald Green `#10B981` (Usar para estados activos, botones de acción secundaria, switches y badges).
- **Backgrounds:** Pure White `#FFFFFF` y Soft Light Gray `#FAFAFA`.
- **Ratings & Highlights:** Warm Gold `#F59E0B`.
- **Typography:** Inter / System Font, alto contraste, jerarquía clara.

### 2. Mobile App Specific Rules (Flutter)
- **Branding & Logo:** 
  - Usar siempre el logo oficial del rombo (`assets/images/app_icono.png`) sobre fondo oscuro `#0F172A`.
  - Nombre de la app: "BoliviaExperience" (Subtítulo: "Santa Cruz de la Sierra"). NUNCA usar "Explore Bolivia".
- **Component Styling:**
  - **Login:** Header con gradiente o fondo oscuro `#0F172A`, campos con bordes finos y botón primario en `#0F172A`.
  - **Home / Banners:** Tarjetas con gradiente elegante de Navy a Esmeralda (`#0F172A` -> `#10B981`). Categorías en estilo "pills/chips" con estado activo esmeralda.
  - **Explorar:** Tarjetas de categorías con iconos vectoriales limpios y fondos suaves, sin repetir iconos genéricos.
  - **Cards & Shadows:** Sombras suaves (`blurRadius: 8`, opacidad del negro a `0.05`), bordes redondeados (`BorderRadius.circular(16)`).
  - **BottomNavigationBar:** Iconos activos en `#0F172A` o `#10B981` y neutros en gris sutil.
