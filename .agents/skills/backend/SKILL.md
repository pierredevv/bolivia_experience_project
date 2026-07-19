---
name: "nestjs_backend_architecture"
description: "Reglas de NestJS: interceptores globales, validación de DTOs, Prisma y RolesGuard."
---

# Arquitectura Backend en NestJS

## 1. Validaciones y DTOs
- Usa siempre `class-validator` y `class-transformer` en los DTOs.
- Habilita `whitelist: true` y `forbidNonWhitelisted: true` en el `ValidationPipe` global para evitar inyecciones de datos no esperados en peticiones POST/PATCH.

## 2. RolesGuard y Seguridad
- La plataforma tiene múltiples roles: `ADMIN`, `BUSINESS`, `USER`.
- Utiliza el decorador personalizado `@Roles()` junto con un `RolesGuard` que intercepte el token de Firebase Auth y verifique el array de claims.
- NUNCA expongas endpoints de escritura de lugares o eventos sin la protección explícita de `JwtAuthGuard` y `RolesGuard`.

## 3. Prisma y PostGIS (Consultas Raw)
- Para calcular distancias, usa el motor de base de datos, no la memoria del servidor de Node.js.
- Ejemplo conceptual de uso espacial: 
  `PRISMA.$queryRaw\`SELECT id, name, ST_DistanceSphere(geom, ST_MakePoint(\${lng}, \${lat})) as distance FROM Location ORDER BY distance LIMIT 10\``
