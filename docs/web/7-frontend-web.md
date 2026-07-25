# 7. Frontend Web (React) — BoliviaExperience

**Proyecto:** BoliviaExperience
**Versión:** 1.0
**Fecha:** 2026-06-26
**Responsables:** Frontend Lead, React Developer

---

## 1. Estructura del Proyecto

```
web/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── index.html
└── src/
    ├── main.tsx               # Entry point
    ├── App.tsx                 # Router principal
    ├── index.css               # Estilos globales + CSS Variables
    ├── services/
    │   └── api.ts              # Cliente Axios + endpoints
    ├── types/
    │   └── index.ts            # TypeScript interfaces
    ├── components/
    │   └── layout/
    │       ├── AdminLayout.tsx # Layout Panel Admin
    │       └── EmpresaLayout.tsx # Layout Panel Empresa
    └── pages/
        ├── LoginPage.tsx       # Login compartido
        ├── admin/              # 8 páginas Admin
        │   ├── Dashboard.tsx
        │   ├── Users.tsx
        │   ├── Places.tsx
        │   ├── Reviews.tsx
        │   ├── Events.tsx
        │   ├── Promotions.tsx
        │   ├── Categories.tsx
        │   └── Settings.tsx
        └── empresa/            # 6 páginas Empresa
            ├── Dashboard.tsx
            ├── Place.tsx
            ├── Reviews.tsx
            ├── Promotions.tsx
            ├── Stats.tsx
            └── Photos.tsx
```

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Lenguaje | TypeScript | 5.3 |
| Routing | React Router | 6.x |
| Data Fetching | TanStack React Query | 5.x |
| Styling | Tailwind CSS | 3.4 |
| Components | Radix UI | - |
| HTTP Client | Axios | 1.6 |
| Forms | React Hook Form + Zod | - |
| Charts | Recharts | 2.x |
| Icons | Lucide React | - |

---

## 3. Paneles Implementados

### 3.1 Panel Administrativo

| Página | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| Dashboard | /admin | KPIs, gráficos, actividad reciente | ✅ |
| Usuarios | /admin/users | CRUD, filtros, paginación | ✅ |
| Lugares | /admin/places | Grid, filtros, acciones | ✅ |
| Reseñas | /admin/reviews | Moderación (aprobar/rechazar) | ✅ |
| Eventos | /admin/events | CRUD eventos | ✅ |
| Promociones | /admin/promotions | Ver promociones | ✅ |
| Categorías | /admin/categories | CRUD categorías | ✅ |
| Configuración | /admin/settings | Ajustes plataforma | ✅ |

### 3.2 Panel Empresa

| Página | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| Dashboard | /empresa | Stats, reseñas, acciones rápidas | ✅ |
| Mi Lugar | /empresa/place | Editar info del negocio | ✅ |
| Reseñas | /empresa/reviews | Ver y responder reseñas | ✅ |
| Promociones | /empresa/promotions | CRUD promociones | ✅ |
| Estadísticas | /empresa/stats | Gráficos, métricas | ✅ |
| Fotos | /empresa/photos | Gestión de fotos | ✅ |

---

## 4. Componentes UI

### 4.1 Layout Components

- **AdminLayout**: Sidebar + Topbar + Outlet
- **EmpresaLayout**: Sidebar + Topbar + Outlet

### 4.2 Características

- Responsive (mobile sidebar con overlay)
- Navegación con NavLink (active state)
- Notificaciones badge
- User avatar dropdown
- Logout functionality

---

## 5. API Integration

### 5.1 Cliente Axios

```typescript
// Configuración base
- baseURL: /api/v1 (proxy en desarrollo)
- timeout: 10s
- Auth: Bearer token desde localStorage
- Interceptor 401: redirect a /login
```

### 5.2 Endpoints Definidos

- authApi: login, register
- usersApi: getAll, getById, update, ban
- placesApi: getAll, getById, create, update, delete, toggleStatus
- categoriesApi: getAll, create, update, delete
- reviewsApi: getByPlace, getAll, approve, delete
- eventsApi: getAll, getById, create, update, delete
- promotionsApi: getAll, create, update, delete
- dashboardApi: getStats, getEmpresaStats
- empresaApi: getPlace, updatePlace, getReviews, getStats

---

## 6. Diseño

### 6.1 Paleta

- **Primary:** Verde (#43A047) — Color oficial, CTAs principales
- **Secondary:** Azul (#1976D2) — Links, info, acentos
- **Neutrals:** Escala de grises

### 6.2 Tipografía

- **Familia:** Inter
- **Tamaños:** 12, 14, 16, 18, 20, 24, 32

### 6.3 Componentes Tailwind

- Cards con shadow-sm
- Buttons con hover states
- Tables con hover rows
- Form inputs con focus rings
- Badges/Tags con colores semánticos

---

## 7. Comandos de Desarrollo

```bash
# Instalar dependencias
cd web
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

---

## 8. Checklist de Completitud — Entregable 7

- [x] Estructura del proyecto React + Vite
- [x] Configuración TypeScript
- [x] Configuración Tailwind CSS
- [x] Cliente Axios con interceptors
- [x] TypeScript interfaces
- [x] Panel Admin (8 páginas):
  - [x] Dashboard con KPIs
  - [x] Usuarios (CRUD + filtros)
  - [x] Lugares (grid + filtros)
  - [x] Reseñas (moderación)
  - [x] Eventos (CRUD)
  - [x] Promociones
  - [x] Categorías
  - [x] Configuración
- [x] Panel Empresa (6 páginas):
  - [x] Dashboard
  - [x] Mi Lugar (edición)
  - [x] Reseñas (responder)
  - [x] Promociones (CRUD)
  - [x] Estadísticas
  - [x] Fotos
- [x] Login Page
- [x] Layouts responsivos
- [x] Navegación con React Router

---

**Próximo entregable:** 8 — Infraestructura DevOps
