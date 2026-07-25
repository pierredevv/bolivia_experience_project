# Plan Maestro de Pulido y Refactorización Web (web/src)

> **Evaluación realizada por los Agentes:**
> - **Tech Architect** (`.mimocode/agents/tech-architect/AGENT.md`): Arquitectura de software, TypeScript estricto, abstracción de componentes, manejo de errores, performance y limpieza de código.
> - **UI/UX Designer** (`.mimocode/agents/ui-ux-designer/AGENT.md`): Jerarquía visual, paddings, consistencia con Design System (Design Tokens), responsive mobile-first, accesibilidad WCAG 2.1 AA y soporte Dark/Light mode.

---

## 📋 Resumen Ejecutivo & Métricas de Diagnóstico

| Categoría | Archivos Inspeccionados | Hallazgos Principales | Prioridad |
| :--- | :---: | :--- | :---: |
| **Layouts & Navegación** | 3 | Duplicación masiva (>85%) entre `AdminLayout`, `BusinessLayout` y `EmpresaLayout`. Falta adaptabilidad Dark/Light real en topbar. | 🔴 Alta |
| **Autenticación (Logins)** | 3 | Tres pantallas de Login (`LoginPage`, `AdminLoginPage`, `BusinessLoginPage`) con código casi idéntico. | 🔴 Alta |
| **Componentes UI Base** | 10 | `DataTable` falta de ordenamiento genérico typed/multi-campo y versión móvil en tarjetas; `Modal` e `Input` carecen de ARIA/WCAG completo. | 🟡 Media |
| **Módulo Admin (`pages/admin`)** | 10 | Uso de `any` en tipado, tablas no responsivas en smartphones, inputs de búsqueda no vinculados en filtros, modales extensos sin modularizar. | 🔴 Alta |
| **Módulo Empresa (`pages/empresa`)** | 6 | Forms de gestión sin feedback estructurado, falta de drag & drop visual moderno en fotos, inconsistencia de colores primarios. | 🟡 Media |
| **Landing & Secciones (`sections`)** | 10 | Phone mockup con riesgo de desbordamiento en viewports intermedios (regla de solapamiento), micro-interacciones mejorables, botones con targets <44px. | 🟢 Normal |
| **Capa de Datos & Servicios** | 15 | `services/api.ts` con manejo de errores genérico sin tipar; hooks con tipados manuales en lugar de generics robustos. | 🟡 Media |

---

## 📁 1. Configuración Raíz (`web/src/`)

### 📄 `web/src/App.tsx`
- [ ] **UI/UX**:
  - [ ] Implementar un componente de fallback en `SuspenseWrapper` más pulido con esqueleto decorativo (Skeleton layout) en lugar de spinner aislado.
  - [ ] Agregar transiciones suaves de página (framer-motion `AnimatePresence`) entre cambios de ruta.
- [ ] **Refactor / Clean Code**:
  - [ ] Agrupar y modularizar definiciones de rutas en una constante estructurada o mapa de configuración de rutas (`routes.config.ts`).
  - [ ] Centralizar validaciones de rol dentro de `ProtectedRoute` para evitar redundancias entre `/admin-panel` y `/business`.

### 📄 `web/src/main.tsx`
- [ ] **UI/UX**:
  - [ ] Personalizar la configuración visual del componente `<Toaster />` (Toast notification system) para reflejar los tokens de color del Design System (#43A047 primary, #1565C0 secondary, dark mode support).
- [ ] **Refactor / Clean Code**:
  - [ ] Extraer la instanciación de `QueryClient` a una configuración dedicada (`lib/query-client.ts`) para incluir manejo global de errores de red (retry logic y toast global para 500s/offline).

### 📄 `web/src/index.css`
- [ ] **UI/UX**:
  - [ ] Homologar variables CSS custom properties (`--primary`, `--secondary`) con los tokens exactos definidos en el Design System (`docs/design/3.1-design-tokens.md`: Primary Green `#43A047`, Secondary Blue `#1976D2`).
  - [ ] Asegurar utilidades globales para ocultar scrollbars estéticamente (`no-scrollbar`) y clases de sombra consistentes (`elevation-1` a `elevation-6`).
- [ ] **Refactor / Clean Code**:
  - [ ] Eliminar estilos redundantes de focus visible y unificar reglas `@layer base` para Tailwind v3.

---

## 📁 2. Layouts de la Aplicación (`web/src/components/layout/`)

### 📄 `web/src/components/layout/AdminLayout.tsx`
- [ ] **UI/UX**:
  - [ ] Corregir la discrepancia de assets de logotipo (`/BoliviaExperience.png` en móvil vs `/LogoBoliviaExperience.png` en desktop).
  - [ ] Cambiar el fondo del Topbar y `main` de `bg-white` a un sistema semántico adaptativo (`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`).
  - [ ] Ampliar las áreas de click/touch de los botones de la barra superior (tema, notificaciones) a mínimo 44x44px (cumplimiento WCAG 2.1 AA).
  - [ ] Agregar atributo `aria-label` en el botón hamburguesa móvil y selector de tema.
- [ ] **Refactor / Clean Code**:
  - [ ] Eliminar funciones duplicadas `sidebarLinkClass` y `mobileSidebarLinkClass` (tienen exactamente el mismo código).
  - [ ] Refactorizar la estructura general hacia un componente base compartido `BaseDashboardLayout` para eliminar duplicación con `BusinessLayout` y `EmpresaLayout`.

### 📄 `web/src/components/layout/BusinessLayout.tsx`
- [ ] **UI/UX**:
  - [ ] Adaptar todos los contenedores de contenido y paneles a modo oscuro mediante variables semánticas (`dark:bg-slate-900 dark:text-slate-100`).
  - [ ] Mejorar el indicador activo del menú lateral utilizando un gradiente suave en lugar de una barra lateral rígida.
  - [ ] Ajustar accesibilidad en el avatar de usuario con fallback y menu desplegable interactivo por teclado.
- [ ] **Refactor / Clean Code**:
  - [ ] Consolidar la duplicación de código de sidebar con `AdminLayout.tsx`. Extraer `SidebarNavigation` y `HeaderUserMenu` como componentes independientes.

### 📄 `web/src/components/layout/EmpresaLayout.tsx`
- [ ] **UI/UX**:
  - [ ] Asegurar contraste suficiente en los textos del menú lateral en pantallas de baja resolución.
  - [ ] Corregir paddings internos del área principal (`main p-6`) para que en dispositivos móviles (`sm:p-4`) no reduzca excesivamente el espacio de trabajo.
- [ ] **Refactor / Clean Code**:
  - [ ] Reemplazar la definición en línea de items de navegación por una constante modular compartida en `config/navigation.ts`.

---

## 📁 3. Componentes Reutilizables & UI System (`web/src/components/`)

### 📄 `web/src/components/Navbar.tsx`
- [ ] **UI/UX**:
  - [ ] Ajustar el z-index y padding en móviles para prevenir que elementos de la cabecera queden recortados.
  - [ ] Mejorar la visibilidad de focus en la navegación de teclado y verificar el contraste del botón de cambio de idioma (`ES/EN`) sobre fondos oscuros/claros.
- [ ] **Refactor / Clean Code**:
  - [ ] Simplificar la lógica de trampa de foco (`focus trap`) delegándola o aislándola en un custom hook reusable `useFocusTrap`.

### 📄 `web/src/components/Footer.tsx`
- [ ] **UI/UX**:
  - [ ] Aumentar el contraste del texto secundario (`text-neutral-500` -> `text-neutral-400` sobre `bg-neutral-900`) para cumplir contraste mínimo WCAG (4.5:1).
  - [ ] Garantizar que las áreas de click de las redes sociales cumplan con los 44x44px.
- [ ] **Refactor / Clean Code**:
  - [ ] Extraer las listas de enlaces y SVGs sociales a un archivo de constantes (`footerData.ts`).

### 📄 `web/src/components/ErrorBoundary.tsx`
- [ ] **UI/UX**:
  - [ ] Diseñar una vista de error amigable con ilustración/icono relativo a BoliviaExperience, botón para reintentar y opción de regresar al inicio.
- [ ] **Refactor / Clean Code**:
  - [ ] Tipar explícitamente los estados de `ErrorBoundary` y capturar eventos de log a un servicio de monitoreo/telemetría si aplica.

### 📄 `web/src/components/ProtectedRoute.tsx`
- [ ] **UI/UX**:
  - [ ] Agregar un estado de carga elegante (Skeleton o Spinner alineado) mientras se resuelve la verificación de sesión inicial para evitar parpadeos de pantalla blanca.
- [ ] **Refactor / Clean Code**:
  - [ ] Mejorar el chequeo de roles para soportar arreglos de permisos y redirección dinámica basada en la última ruta intentada.

### 📄 `web/src/components/ui/DataTable.tsx`
- [ ] **UI/UX**:
  - [ ] Agregar indicador visual para columnas ordenables incluso cuando no están seleccionadas (icono de orden neutro).
  - [ ] Implementar vista adaptativa de tarjetas (`Card View`) en dispositivos móviles (`< md`) para evitar scroll horizontal excesivo y mejorar legibilidad.
- [ ] **Refactor / Clean Code**:
  - [ ] Reemplazar `T extends Record<string, any>` con tipado estricto `keyof T` y permitir funciones comparadoras custom en el sort para soportar fechas, números y campos anidados.
  - [ ] Aceptar función personalizada `searchFilter` en lugar de requerir una única `searchKey` en formato string.

### 📄 `web/src/components/ui/Modal.tsx`
- [ ] **UI/UX**:
  - [ ] Añadir animación de entrada/salida (fade & scale) para una experiencia de usuario más fluida.
  - [ ] Asegurar soporte completo de aria (`aria-modal="true"`, `role="dialog"`, `aria-labelledby`).
- [ ] **Refactor / Clean Code**:
  - [ ] Implementar `Portal` de React (`createPortal`) para renderizar el modal en el `document.body` y evitar problemas de stacking context (`z-index`).

### 📄 `web/src/components/ui/ConfirmDialog.tsx`
- [ ] **UI/UX**:
  - [ ] Enfatizar los botones de acción crítica (variante peligrosa/destructiva) con estados hover/active de alto contraste.
- [ ] **Refactor / Clean Code**:
  - [ ] Refactorizar para reutilizar `Modal.tsx` en lugar de reimplementar la capa overlay de fondo.

### 📄 `web/src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`
- [ ] **UI/UX**:
  - [ ] Estandarizar la altura de inputs (`h-11` o `py-2.5`), radios de borde (`rounded-xl`) y estados de focus con `ring-primary-500/20`.
  - [ ] Agregar soporte para iconos a la izquierda/derecha mediante props (`leftIcon`, `rightIcon`).
- [ ] **Refactor / Clean Code**:
  - [ ] Asegurar reenvío de refs completo (`forwardRef`) y tipados TS limpios extendiendo adecuadamente `React.InputHTMLAttributes`.

### 📄 `web/src/components/ui/Pagination.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`, `Skeleton.tsx`
- [ ] **UI/UX**:
  - [ ] `Pagination`: Aumentar el tamaño de botones de página en móviles para facilar la pulsación táctil.
  - [ ] `EmptyState`: Permitir personalización de acciones secundarias e ilustración vectorial.
- [ ] **Refactor / Clean Code**:
  - [ ] Estandarizar variantes de color y tamaño utilizando utilidades de `clsx`/`tailwind-merge`.

---

## 📁 4. Panel de Administración (`web/src/pages/admin/`)

### 📄 `web/src/pages/admin/AdminLoginPage.tsx`
- [ ] **UI/UX**:
  - [ ] Ajustar el espaciado interno en móviles (`p-6` vs `p-8`) para evitar overflow vertical en pantallas pequeñas.
  - [ ] Mejorar mensajes de error contextuales con animaciones de sacudida (*shake effect*) en intentos fallidos.
- [ ] **Refactor / Clean Code**:
  - [ ] Extraer hacia un componente unificado `AuthLoginForm` reutilizable por las 3 pantallas de inicio de sesión.

### 📄 `web/src/pages/admin/Dashboard.tsx`
- [ ] **UI/UX**:
  - [ ] Bento Grid: Uniformar las alturas de las tarjetas de gráficos y listados recientes para mantener equilibrio visual en escritorios.
  - [ ] Gráficos Recharts: Configurar colores responsivos adaptados al tema claro/oscuro de la aplicación.
  - [ ] Añadir tooltips interactivos con mejor contraste y bordes redondeados.
- [ ] **Refactor / Clean Code**:
  - [ ] Eliminar tipados implícitos `any` en funciones map/filter (`r: any`, `user: any`).
  - [ ] Modularizar los sub-componentes de Dashboard (`StatCard`, `RatingChart`, `RecentReviewsList`, `RecentUsersTable`).

### 📄 `web/src/pages/admin/Businesses.tsx`
- [ ] **UI/UX**:
  - [ ] Vincular el campo de búsqueda visual con el estado de filtrado (actualmente la caja de búsqueda de texto no ejecuta el filtro de datos).
  - [ ] Agregar badges de estado con paleta inclusiva (icono + texto) para distinguir rápidamente empresas pendientes, aprobadas y suspendidas.
- [ ] **Refactor / Clean Code**:
  - [ ] Eliminar tipados `any` en la iteración de empresas (`business: any`).
  - [ ] Conectar la paginación con el hook de React Query.

### 📄 `web/src/pages/admin/Places.tsx`
- [ ] **UI/UX**:
  - [ ] Rediseñar la tabla de lugares incorporando miniaturas de imágenes con lazy loading y fallback si la URL está rota.
  - [ ] Mejorar la experiencia del modal de creación/edición de lugares dividiendo el formulario en pestañas (Información General, Ubicación/Mapa, Horarios, Multimedia).
- [ ] **Refactor / Clean Code**:
  - [ ] Descomponer el componente extenso (>400 líneas) separando `PlaceModalForm.tsx` y `PlacesTable.tsx`.
  - [ ] Implementar tipado estricto para las coordenadas y esquemas de lugares.

### 📄 `web/src/pages/admin/Users.tsx`
- [ ] **UI/UX**:
  - [ ] Formatear las fechas de registro con localización (`date-fns/locale/es`) y tiempo relativo ("hace 2 días").
  - [ ] Incluir selector de cambio rápido de rol con diálogo de confirmación previa.
- [ ] **Refactor / Clean Code**:
  - [ ] Evitar mutations directas sin manejo de errores centralizado; envolver acciones en `try/catch` con feedback vía toast.

### 📄 `web/src/pages/admin/Categories.tsx`
- [ ] **UI/UX**:
  - [ ] Agregar selector interactivo de iconos (Lucide icons preview) y picker de color para la creación de categorías.
- [ ] **Refactor / Clean Code**:
  - [ ] Reemplazar llamadas inline de API por hooks customizados uniformes (`useCategories`).

### 📄 `web/src/pages/admin/Events.tsx`
- [ ] **UI/UX**:
  - [ ] Mostrar indicadores visuales para eventos próximos vs eventos vencidos mediante códigos de color semánticos.
  - [ ] Input de rango de fechas intuitivo.
- [ ] **Refactor / Clean Code**:
  - [ ] Formateo estandarizado de precios en moneda local (`Bs.`) mediante una utilidad `formatCurrency`.

### 📄 `web/src/pages/admin/Promotions.tsx`
- [ ] **UI/UX**:
  - [ ] Tarjeta de descuento destacada con badges de porcentaje e indicador de vigencia.
- [ ] **Refactor / Clean Code**:
  - [ ] Validar que la fecha de fin no sea inferior a la fecha de inicio en el formulario.

### 📄 `web/src/pages/admin/Reviews.tsx`
- [ ] **UI/UX**:
  - [ ] Filtro rápido por estrellas (1 a 5 estrellas) y botón de moderación/eliminación rápida de comentarios inapropiados.
- [ ] **Refactor / Clean Code**:
  - [ ] Implementar scroll infinito o paginación en servidor para el manejo eficiente de grandes volúmenes de reseñas.

### 📄 `web/src/pages/admin/Settings.tsx`
- [ ] **UI/UX**:
  - [ ] Organizar configuraciones por secciones colapsables o tabs (General, Notificaciones, Seguridad, Backup).
- [ ] **Refactor / Clean Code**:
  - [ ] Reemplazar inputs desconectados por un estado global de formulario con `react-hook-form` o `zod`.

---

## 📁 5. Portal de Negocio & Empresa (`web/src/pages/business/` & `web/src/pages/empresa/`)

### 📄 `web/src/pages/business/BusinessLoginPage.tsx`
- [ ] **UI/UX**:
  - [ ] Destacar visualmente las alertas de "Cuenta Pendiente" y "Cuenta Desactivada" con iconografía amigable.
- [ ] **Refactor / Clean Code**:
  - [ ] Consolidar la vista con el componente reutilizable `AuthLoginForm`.

### 📄 `web/src/pages/business/BusinessRegisterPage.tsx`
- [ ] **UI/UX**:
  - [ ] Estructurar el formulario de registro en un asistente por pasos (*StepperWizard*): Step 1 (Datos de usuario), Step 2 (Datos del negocio), Step 3 (Ubicación y categoría).
  - [ ] Agregar indicadores de fortaleza de contraseña.
- [ ] **Refactor / Clean Code**:
  - [ ] Descomponer el archivo masivo (>500 líneas) en subcomponentes por paso (`StepUserData.tsx`, `StepBusinessData.tsx`, `StepLocationData.tsx`).
  - [ ] Implementar validación de esquemas Zod en cliente antes de enviar la petición.

### 📄 `web/src/pages/empresa/Dashboard.tsx`
- [ ] **UI/UX**:
  - [ ] Mostrar resumen de métricas clave del negocio (visitas, reseñas acumuladas, calificación promedio) con accesos directos a completar perfil.
- [ ] **Refactor / Clean Code**:
  - [ ] Refactorizar la extracción de datos usando el hook `useEmpresaDashboard`.

### 📄 `web/src/pages/empresa/Place.tsx`
- [ ] **UI/UX**:
  - [ ] Diseñar previsualización en tiempo real (*Live Card Preview*) de cómo se verá el negocio en la App móvil mientras el usuario edita su información.
- [ ] **Refactor / Clean Code**:
  - [ ] Extraer el componente de mapa/selector de coordenadas a un módulo reutilizable `LocationPickerMap.tsx`.

### 📄 `web/src/pages/empresa/Photos.tsx`
- [ ] **UI/UX**:
  - [ ] Implementar zona de arrastrar y soltar (*Drag & Drop Zone*) para la carga de fotografías con preview inmediato y barra de progreso.
  - [ ] Permitir reordenamiento de fotos principales.
- [ ] **Refactor / Clean Code**:
  - [ ] Manejar la subida asíncrona de imágenes medianteFormData con cancelación de request y validación de tipos MIME/peso de imagen.

### 📄 `web/src/pages/empresa/Promotions.tsx` & `Reviews.tsx` & `Stats.tsx`
- [ ] **UI/UX**:
  - [ ] `Promotions`: Formulario modal claro para crear ofertas temporales.
  - [ ] `Reviews`: Permitir a la empresa responder públicamente a las reseñas de los clientes.
  - [ ] `Stats`: Gráficos limpios de interacción mensual y horarios de mayor afluencia.
- [ ] **Refactor / Clean Code**:
  - [ ] Tipar adecuadamente las estructuras de respuesta del módulo empresa en `types/index.ts`.

---

## 📁 6. Vistas Generales & Legales (`web/src/pages/` & `web/src/pages/legal/`)

### 📄 `web/src/pages/LoginPage.tsx`
- [ ] **UI/UX**:
  - [ ] Homologar diseño con el sistema general de login.
- [ ] **Refactor / Clean Code**:
  - [ ] Evaluar eliminación o redirección hacia `/admin-panel/login` para evitar rutas obsoletas o duplicadas.

### 📄 `web/src/pages/Landing.tsx`
- [ ] **UI/UX**:
  - [ ] Asegurar transiciones suaves entre secciones y controlar los paddings verticales (`py-16 md:py-24`) para mantener ritmo visual constante.
- [ ] **Refactor / Clean Code**:
  - [ ] Verificar el lazy loading de secciones secundarias si se requiere optimizar el LCP (Largest Contentful Paint).

### 📄 `web/src/pages/legal/PrivacyPolicy.tsx` & `TermsOfService.tsx`
- [ ] **UI/UX**:
  - [ ] Mejorar la legibilidad tipográfica (ancho máximo de lectura `max-w-3xl`, interlineado relajado `leading-relaxed`, tabla de contenidos lateral).
  - [ ] Incluir botón para descargar en PDF o imprimir la política.
- [ ] **Refactor / Clean Code**:
  - [ ] Extraer el envoltorio común de documentos legales a `LegalDocLayout.tsx`.

---

## 📁 7. Secciones de la Landing Page (`web/src/sections/`)

### 📄 `web/src/sections/Hero.tsx`
- [ ] **UI/UX**:
  - [ ] **Regla de Solapamiento**: Ajustar la posición y responsive del phone mockup (`right-[4%]`) para evitar que se superponga con el texto del lado izquierdo en resoluciones entre 1024px y 1280px (`lg:max-w-[550px]`).
  - [ ] Aumentar la legibilidad del texto sobre el fondo mediante una capa de degradado adaptativa (*scrim layer*).
- [ ] **Refactor / Clean Code**:
  - [ ] Extraer el sub-componente decorativo `PhoneMockup.tsx` fuera del archivo principal.

### 📄 `web/src/sections/SocialProofStrip.tsx`
- [ ] **UI/UX**:
  - [ ] Añadir animación continua sutil (marquee slider) de logotipos/partners de Bolivia.
- [ ] **Refactor / Clean Code**:
  - [ ] Simplificar la estructura del componente.

### 📄 `web/src/sections/HowItWorks.tsx`
- [ ] **UI/UX**:
  - [ ] Conectar los pasos con una línea punteada o indicadores numéricos de alto contraste.
- [ ] **Refactor / Clean Code**:
  - [ ] Desestructurar los datos de pasos en una constante fuertemente tipada.

### 📄 `web/src/sections/FeaturesPreview.tsx`
- [ ] **UI/UX**:
  - [ ] Aplicar tarjetas glassmorphism con efectos hover (elevación y border glow).
- [ ] **Refactor / Clean Code**:
  - [ ] Reutilizar componentes de tarjetas compartidos.

### 📄 `web/src/sections/Categories.tsx`
- [ ] **UI/UX**:
  - [ ] Grid responsiva ajustada (`grid-cols-2 sm:grid-cols-3 md:grid-cols-5`) con badges de categorías coloridos.
- [ ] **Refactor / Clean Code**:
  - [ ] Conectar la sección con los datos reales de la API si la Landing está dinámica, o mantener fallback estático limpio.

### 📄 `web/src/sections/ForBusiness.tsx`
- [ ] **UI/UX**:
  - [ ] Destacar la propuesta de valor para negocios con un CTA de alto impacto visual hacia `/business/register`.
- [ ] **Refactor / Clean Code**:
  - [ ] Optimizar imágenes decorativas con formato WebP y `loading="lazy"`.

### 📄 `web/src/sections/Testimonials.tsx`
- [ ] **UI/UX**:
  - [ ] Incluir carrusel o grid de testimonios con fotos de perfil reales/locales y puntuaciones con estrellas.
- [ ] **Refactor / Clean Code**:
  - [ ] Extraer componente `TestimonialCard.tsx`.

### 📄 `web/src/sections/MapSection.tsx`
- [ ] **UI/UX**:
  - [ ] Interfaz interactiva de mapa o vista previa de lugares turísticos emblemáticos de Santa Cruz.
- [ ] **Refactor / Clean Code**:
  - [ ] Controlar el renderizado condicional de scripts de mapas para evitar leaks de memoria.

### 📄 `web/src/sections/FAQ.tsx`
- [ ] **UI/UX**:
  - [ ] Componente Acordeón animado accesible por teclado (`aria-expanded`, `role="button"`).
- [ ] **Refactor / Clean Code**:
  - [ ] Extraer la lista de preguntas/respuestas a `faqData.ts`.

### 📄 `web/src/sections/FinalCTA.tsx`
- [ ] **UI/UX**:
  - [ ] Gradiente vibrante alineado con la identidad de marca (Verde Esmeralda / Slate) y botones de descarga a las App Stores.
- [ ] **Refactor / Clean Code**:
  - [ ] Reutilizar enlaces y badges de tienda uniformes.

---

## 📁 8. Capa de Arquitectura, Estado & Servicios (`web/src/`)

### 📄 `web/src/contexts/` (`AuthContext.tsx`, `LangContext.tsx`, `ThemeContext.tsx`)
- [ ] **UI/UX**:
  - [ ] Asegurar sincronización del tema oscuro (`dark` class) con el elemento `<html>` sin FOUC (*Flash of Unstyled Content*).
- [ ] **Refactor / Clean Code**:
  - [ ] `AuthContext`: Manejar expiración de token JWT en localStorage mediante expiración calculada o refresh token.
  - [ ] `LangContext`: Tipar estrictamente las llaves de traducción `t('...')` para autocompletado y prevenir traducciones faltantes.

### 📄 `web/src/hooks/` (`useAuth`, `usePlaces`, `useBusinesses`, `useDashboard`, etc.)
- [ ] **Refactor / Clean Code**:
  - [ ] Estandarizar todas las llamadas de React Query utilizando llaves de query estructuradas (`queryKeys` factory pattern).
  - [ ] Reemplazar casteo manual `as any` en manejo de errores por una utilidad `parseApiError(error)`.

### 📄 `web/src/services/api.ts`
- [ ] **Refactor / Clean Code**:
  - [ ] Configurar interceptores de Axios para inyección automática de Bearer Token y manejo global de respuestas de error (401 Unauthorized -> redirección limpia a login sin refresco duro).
  - [ ] Tipar fuertemente las respuestas DTO de cada endpoint de la API.

### 📄 `web/src/types/index.ts` & `web/src/lib/utils.ts`
- [ ] **Refactor / Clean Code**:
  - [ ] Eliminar tipos duplicados o genéricos incompletos.
  - [ ] Agregar utilidades compartidas en `utils.ts` (`cn`, `formatCurrency`, `formatDateRelative`, `truncateText`).

---

## 🚀 Plan de Ejecución Priorizado

1. **Fase 1: Abstracción de Core & Layouts (Prioridad 🔴 Alta)**
   - Crear `AuthLoginForm.tsx` y consolidar las 3 pantallas de inicio de sesión.
   - Refactorizar `AdminLayout`, `BusinessLayout` y `EmpresaLayout` con un `BaseDashboardLayout` reutilizable.
   - Tipar e igualar `index.css` con los Design Tokens oficiales.

2. **Fase 2: Componentes UI Base & Accesibilidad (Prioridad 🟡 Media)**
   - Mejorar `DataTable.tsx` (vista móvil + tipado estricto de sorting).
   - Añadir Portals y atributos ARIA a `Modal.tsx` y `ConfirmDialog.tsx`.
   - Homologar `Input.tsx`, `Select.tsx` y `Textarea.tsx`.

3. **Fase 3: Módulos Admin & Empresa (Prioridad 🔴 Alta / 🟡 Media)**
   - Eliminar los tipos `any` en `Dashboard`, `Businesses`, `Places` y `Users`.
   - Conectar filtros de búsqueda visuales a hooks de React Query.
   - Implementar StepperWizard en `BusinessRegisterPage.tsx`.

4. **Fase 4: Landing Page, Secciones & Interacciones (Prioridad 🟢 Normal)**
   - Corregir regla de solapamiento del phone mockup en `Hero.tsx`.
   - Accesibilidad en `Navbar.tsx`, `Footer.tsx` y acordeón `FAQ.tsx`.
   - Marquee en `SocialProofStrip.tsx`.
