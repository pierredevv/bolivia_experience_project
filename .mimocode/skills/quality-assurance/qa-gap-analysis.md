---
name: qa-gap-analysis
description: >
  Análisis de gaps entre el MVP requerido y lo implementado.
  Ejecuta al invocar /qa-gap-analysis.
---

# QA: Gap Analysis MVP

## Propósito

Comparar formalmente lo que el MVP requiere contra lo que está implementado, e identificar todos los gaps.

## Protocolo

### Paso 1: Definir Alcance MVP
1. Leer `docs/business/1.5-mvp-hipotesis-metricas-validacion.md`
2. Extraer features del MVP
3. Definir criterios de completitud

### Paso 2: Verificar Implementación
1. Leer `handoff.md` para estado actual
2. Verificar código existente
3. Identificar features implementadas

### Paso 3: Comparar y Clasificar

#### Categorías de Gaps

| Categoría | Definición | Prioridad |
|-----------|-----------|-----------|
| **No implementado** | Feature no existe | P0 |
| **Parcial** | Feature existe pero incompleta | P1 |
| **Roto** | Feature existe pero no funciona | P0 |
| **Sin tests** | Feature implementada sin tests | P1 |
| **Sin docs** | Feature sin documentación | P2 |

### Paso 4: Formatear Resultado

```
## Gap Analysis — MVP BoliviaExperience

### Resumen Ejecutivo
- Features requeridas: X
- Implementadas completamente: X
- Parcialmente implementadas: X
- No implementadas: X
- % Completitud: X%

### Gaps por Categoría

#### No Implementados (P0)
| # | Feature | Impacto | Esfuerzo | Dependencia |
|---|---------|---------|----------|-------------|

#### Parcialmente Implementados (P1)
| # | Feature | Lo que falta | Impacto | Esfuerzo |
|---|---------|--------------|---------|----------|

#### Rotos (P0)
| # | Feature | Problema | Impacto | Esfuerzo |
|---|---------|----------|---------|----------|

#### Sin Tests (P1)
| # | Feature | Cobertura actual | Target |
|---|---------|------------------|--------|

### Plan de Acción

#### Semana 1
| Día | Feature | Acción | Responsable |
|-----|---------|--------|-------------|

#### Semana 2
| Día | Feature | Acción | Responsable |
|-----|---------|--------|-------------|

### Riesgos
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|

### Recomendaciones
1. [Prioritaria]
2. [Segunda]
3. [Tercera]
```

## Features MVP Requeridas

### Core (P0)
1. Onboarding (3 pantallas)
2. Login/Registro
3. Google OAuth
4. Home con categorías
5. Búsqueda básica
6. Mapa interactivo
7. Detalle del lugar
8. Favoritos
9. Reseñas (1-5 estrellas)
10. Perfil usuario
11. 200 lugares iniciales
12. 50 fotos de lugares
13. i18n (ES/EN)

### Panel Admin (P0)
14. Dashboard con stats
15. CRUD Lugares
16. CRUD Usuarios
17. CRUD Categorías
18. Moderar reseñas
19. Gestionar eventos
20. Gestionar promociones
21. Aprobar negocios

### Panel Empresa (P1)
22. Mi lugar (editar)
23. Mis reseñas
24. Mis promociones
25. Mis fotos
26. Mis estadísticas
27. Responder reseñas

## Ejemplo

```
## Gap Analysis — MVP BoliviaExperience

### Resumen Ejecutivo
- Features requeridas: 27
- Implementadas completamente: 18
- Parcialmente implementadas: 5
- No implementadas: 4
- % Completitud: 67%

### Gaps No Implementados (P0)
| # | Feature | Impacto | Esfuerzo |
|---|---------|---------|----------|
| 1 | Onboarding (3 pantallas) | CRÍTICO | 2 días |
| 2 | i18n (ES/EN) | ALTO | 3 días |
| 3 | 200 lugares iniciales | CRÍTICO | 1 semana |
| 4 | 50 fotos de lugares | CRÍTICO | 2 semanas |

### Gaps Parcialmente Implementados (P1)
| # | Feature | Lo que falta | Esfuerzo |
|---|---------|--------------|----------|
| 1 | Google OAuth | Credenciales reales | 1 día |
| 2 | Filtros avanzados | Filtros por precio/distancia | 2 días |

### % Completitud por Categoría
- Core Features: 75%
- Panel Admin: 100%
- Panel Empresa: 85%
- Contenido: 10%
- Tests: 90%
```
