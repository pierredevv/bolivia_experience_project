---
name: "react_frontend_logic"
description: "Manejo de rutas protegidas, Suspense, token tracking, y optimización de renderizado en React/Vite."
---

# Lógica del Panel Frontend (React)

## 1. Rutas Protegidas (ProtectedRoute Wrapper)
- Envuelve las rutas de `/admin-panel` y `/business` en un componente `<ProtectedRoute allowedRoles={['ADMIN']}>`.
- Este componente debe consultar el estado de autenticación de un Context o Store (Zustand/Redux). Si el estado está cargando, retornar un `<Spinner />`; si no hay sesión, redirigir a `/login`.

## 2. Lazy Loading y Suspense
- Todas las páginas de nivel superior (ej. `Dashboard`, `LocationsManager`, `Analytics`) deben ser importadas vía `React.lazy()`.
- Envuelve las declaraciones de rutas en `<Suspense fallback={<GlobalLoader />}>` para evitar bloquear la renderización principal de la app.

## 3. Manejo de Tokens
- Al loguear exitosamente con Firebase, recupera el Token JWT.
- Pasa el token en los headers de axios (`Authorization: Bearer <token>`) a NestJS. 
- Implementa un interceptor de axios para gestionar la expiración del token y refrescarlo automáticamente sin perturbar la sesión del usuario.
