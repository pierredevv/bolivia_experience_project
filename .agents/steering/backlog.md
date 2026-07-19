# Backlog Principal - UI/UX y Funcionalidades

## Prioridad Alta (P0) - Sprint Actual
- [ ] **Admin Login (`/admin-panel/login`):**
  - Construir el layout de autenticación.
  - Implementar validación de formulario (React Hook Form + Zod).
  - Integrar el método `signInWithEmailAndPassword` del SDK de Firebase.
  - Diseño: Dividir la pantalla (50% imagen contextual turística y 50% panel limpio de acceso con glassmorphism).
- [ ] **Wrapper de Rutas Protegidas:**
  - Crear el HOC de React que bloquee la entrada al dashboard sin token activo.

## Prioridad Media (P1)
- [ ] **Dashboard Bento Grid:**
  - Crear los componentes visuales esqueleto para las métricas del Dashboard de negocio.
  - Implementar gráficos ligeros (ej. Recharts o Chart.js) para reportar crecimiento semanal.
- [ ] **Motor de Filtros (NestJS / Prisma):**
  - Programar la query para el filtro de `presupuesto` (matemática de costos) y `tiempo` (duración + radio geoespacial).

## Prioridad Baja (P2)
- [ ] **Badge Eventos en Vivo:**
  - Aislar el componente UI (React) y Widget (Flutter) del badge animado.
  - Sincronizar el estado de este badge mediante WebSockets (Socket.io) para activarlo en tiempo real cuando un administrador lance un evento.
