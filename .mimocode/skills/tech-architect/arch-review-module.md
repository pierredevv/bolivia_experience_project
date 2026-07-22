---
name: arch-review-module
description: >
  Revisión arquitectónica completa de un módulo.
  Ejecuta al invocar /arch-review-module.
---

# Architect: Revisión de Módulo

## Propósito

Evaluar la arquitectura de un módulo específico contra buenas prácticas y estándares del proyecto.

## Protocolo

### Paso 1: Identificar Módulo
El usuario debe especificar:
- Nombre del módulo (ej: auth, places, reviews)
- Plataforma (API/Web/App)
- Archivos principales

### Paso 2: Leer Código
1. Leer archivos del módulo
2. Identificar dependencias
3. Verificar estructura
4. Analizar patrones

### Paso 3: Evaluar Dimensiones

#### API (NestJS)
| Dimensión | Qué verificar |
|-----------|---------------|
| Estructura | Controller → Service → DTO → Repository |
| Dependencias | Inyección correcta, sin dependencias circulares |
| Seguridad | Guards, validation, sanitization |
| Testing | Unit tests, E2E tests |
| Documentación | Swagger, comments |

#### Web (React)
| Dimensión | Qué verificar |
|-----------|---------------|
| Estructura | Components → Hooks → Services → Contexts |
| Estado | React Query para server state, Context para UI state |
| Performance | Memoization, lazy loading, code splitting |
| Testing | Component tests, hook tests |
| Accesibilidad | ARIA, labels, keyboard navigation |

#### App (Flutter)
| Dimensión | Qué verificar |
|-----------|---------------|
| Estructura | Features → Data + Presentation |
| Estado | Riverpod providers |
| Performance | const widgets, ListView.builder |
| Testing | Unit tests, Widget tests |
| Plataforma | Platform channels si aplica |

### Paso 4: Formatear Resultado

```
## Revisión Arquitectónica — [Módulo]

### Información
- Módulo: [nombre]
- Plataforma: [API/Web/App]
- Archivos: [lista]

### Estructura
| Capa | Estado | Notas |
|------|--------|-------|
| Controller/Component | ✅/⚠️/❌ | |
| Service/Hook | ✅/⚠️/❌ | |
| DTO/Model | ✅/⚠️/❌ | |
| Repository/Service | ✅/⚠️/❌ | |

### Dependencias
| Dependencia | Tipo | Necesaria? |
|-------------|------|------------|

### Issues Encontrados
| # | Categoría | Issue | Severidad | Solución |
|---|-----------|-------|-----------|----------|

### Deuda Técnica
| # | Tipo | Esfuerzo | Riesgo | Prioridad |
|---|------|----------|--------|-----------|

### Métricas
- Líneas de código: X
- Complejidad ciclomática: X
- Cobertura tests: X%
- Dependencias: X

### Recomendaciones
1. [Prioritaria]
2. [Segunda]
3. [Tercera]
```

## Checklist por Plataforma

### API (NestJS)
- [ ] Módulo registrado en app.module.ts
- [ ] Controller con endpoints documentados
- [ ] Service con lógica de negocio
- [ ] DTOs con validación
- [ ] Guards implementados
- [ ] Tests unitarios (>80%)
- [ ] Tests E2E para flujos críticos
- [ ] Swagger documentado

### Web (React)
- [ ] Componentes en directorio correcto
- [ ] Hooks personalizados extraídos
- [ ] React Query para server state
- [ ] TypeScript estricto
- [ ] Tests con React Testing Library
- [ ] Accesibilidad verificada
- [ ] Performance optimizada

### App (Flutter)
- [ ] Features organizadas por dominio
- [ ] Riverpod para estado
- [ ] Services para API calls
- [ ] Models con serialización
- [ ] Tests unitarios
- [ ] Widget tests
- [ ] const widgets donde sea posible

## Ejemplo

```
## Revisión Arquitectónica — Auth Module (API)

### Estructura
| Capa | Estado | Notas |
|------|--------|-------|
| Controller | ✅ | Endpoints REST correctos |
| Service | ✅ | Lógica de negocio clara |
| DTOs | ⚠️ | Faltan algunos validations |
| Guards | ✅ | JwtAuthGuard + RolesGuard |

### Issues
| # | Categoría | Issue | Severidad | Solución |
|---|-----------|-------|-----------|----------|
| 1 | Seguridad | JWT secret hardcodeado en tests | Menor | Usar env vars |
| 2 | Testing | Cobertura 65% | Importante | Agregar tests edge cases |

### Recomendaciones
1. Agregar rate limiting específico para login
2. Implementar account lockout después de 5 intentos
3. Agregar logging de intentos fallidos
```
