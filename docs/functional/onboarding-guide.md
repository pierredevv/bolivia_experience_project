# Guía de Onboarding — BoliviaExperience

Guía para nuevos miembros del equipo.

---

## Primeros Pasos

### 1. Requisitos

- Node.js 20+
- npm o yarn
- Git
- (Opcional) Docker Desktop

### 2. Clonar el repositorio

```bash
git clone https://github.com/pierredevv/bolivia_experience_project.git
cd bolivia_experience_project
```

### 3. Configurar API

```bash
cd api
npm install
node setup-db.js sqlite --seed
npm run start:dev
```

La API estará disponible en `http://localhost:3000`
Swagger docs en `http://localhost:3000/docs`

### 4. Configurar Web

```bash
cd ../web
npm install
npm run dev
```

El web estará disponible en `http://localhost:5173`

### 5. Verificar

1. Abrir `http://localhost:5173`
2. Navegar a `/admin-panel/login`
3. Login: `admin@boliviaexperience.com` / `password123`
4. Verificar que el dashboard carga correctamente

---

## Arquitectura del Proyecto

### 3 Codebases

| Directorio | Tecnología | Propósito |
|------------|-----------|-----------|
| `api/` | NestJS + TypeScript | Backend API |
| `app/` | Flutter + Dart | App móvil |
| `web/` | React + TypeScript | Paneles web |

### Estructura API

```
api/src/
├── modules/           # Módulos de negocio
│   ├── auth/          # Autenticación
│   ├── places/        # Lugares turísticos
│   ├── admin/         # Panel administrativo
│   ├── empresa/       # Panel empresa
│   ├── notifications/ # Notificaciones
│   └── ...
├── common/            # Código compartido
│   ├── guards/        # JWT + Roles guards
│   ├── interceptors/  # Transform interceptor
│   ├── filters/       # Exception filters
│   └── dto/           # DTOs reutilizables
├── prisma/            # Prisma service
└── config/            # Configuración
```

### Estructura Web

```
web/src/
├── components/        # Componentes UI
│   ├── ui/            # Componentes base (Modal, DataTable, etc.)
│   └── layout/        # Layouts (Admin, Business)
├── contexts/          # React Contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── LangContext.tsx
├── hooks/             # React Query hooks
├── pages/             # Páginas
│   ├── admin/         # Panel admin (10 páginas)
│   ├── empresa/       # Panel empresa (6 páginas)
│   └── legal/         # Páginas legales
├── sections/          # Secciones del landing
├── services/          # API client (Axios)
└── test/              # Tests (Vitest)
```

---

## Convenciones

### Código

- **Idioma:** Variables y UI en español
- **TypeScript:** `noUnusedLocals: true`, `noUnusedParameters: true`
- **NestJS:** Un módulo por feature (controller + service + DTOs)
- **React:** Functional components + hooks
- **Tests:** Un test file por componente/service

### Git

- **Branches:** `develop` (principal), `main` (producción)
- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`)
- **PRs:** Requeridos para merge a `main`

### Testing

```bash
# API unit tests
cd api && npm test

# API E2E tests
cd api && npx jest --config jest-e2e.json

# Web tests
cd web && npm test
```

---

## Desarrollo

### Crear nuevo módulo API

1. Crear directorio en `api/src/modules/tu-modulo/`
2. Crear archivos:
   - `tu-modulo.module.ts`
   - `tu-modulo.controller.ts`
   - `tu-modulo.service.ts`
   - `dto/index.ts`
3. Agregar módulo en `app.module.ts`
4. Agregar tag en Swagger (`main.ts`)
5. Crear tests en `tu-modulo.service.spec.ts`

### Crear nueva página Web

1. Crear archivo en `web/src/pages/tu-pagina.tsx`
2. Agregar ruta en `App.tsx`
3. Crear hook en `web/src/hooks/useTuHook.ts`
4. Agregar test en `web/src/test/`

### Crear nuevo componente UI

1. Crear archivo en `web/src/components/ui/TuComponente.tsx`
2. Exportar desde `index.ts`
3. Crear test en `web/src/test/components/TuComponente.test.tsx`

---

## Recursos

| Recurso | URL |
|---------|-----|
| Swagger API | http://localhost:3000/docs |
| Admin Panel | http://localhost:5173/admin-panel |
| Business Panel | http://localhost:5173/business |
| Landing Page | http://localhost:5173 |
| Handoff | `handoff.md` |
| Roadmap | `docs/business/1.9-roadmap-completo.md` |
