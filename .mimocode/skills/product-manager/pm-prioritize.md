---
name: pm-prioritize
description: >
  Priorizar el backlog de features usando MoSCoW o RICE.
  Ejecuta al invocar /pm-prioritize.
---

# PM: Priorizar Backlog

## Propósito

Tomar una lista de features y priorizarlas usando un framework de priorización.

## Frameworks Disponibles

### MoSCoW (Recomendado para MVP)
- **MUST** (P0): Sin esto no se puede lanzar
- **SHOULD** (P1): Necesario, pero no bloqueante
- **COULD** (P2): Nice to have
- **WON'T** (esta vez): No se implementará ahora

### RICE (Para features con impacto medible)
- **R**each: Usuarios afectados por mes (1-10000)
- **I**mpact: 0.25 (bajo) / 0.5 (medio) / 1 (alto) / 2 (muy alto) / 3 (enorme)
- **C**onfidence: 50% (baja) / 80% (media) / 100% (alta)
- **E**sforço: Persona-meses (0.5, 1, 2, 3, 5, 8, 13)

**Score = (Reach × Impact × Confidence) / Effort**

## Protocolo

### Paso 1: Recopilar Features
Pedir al usuario la lista de features a priorizar, o leer del backlog existente.

### Paso 2: Aplicar Framework
Evaluar cada feature según el framework seleccionado.

### Paso 3: Formatear Resultado

```
## Priorización del Backlog — [Fecha]

### Framework: [MoSCoW / RICE]

### MUST (P0) — Crítico para MVP
| # | Feature | Justificación | Estimación |
|---|---------|---------------|------------|

### SHOULD (P1) — Importante
| # | Feature | Justificación | Estimación |
|---|---------|---------------|------------|

### COULD (P2) — Nice to Have
| # | Feature | Justificación | Estimación |
|---|---------|---------------|------------|

### WON'T (esta vez)
| # | Feature | Razón para postergar |
|---|---------|---------------------|

### Resumen
- Total features: X
- Estimación total: X días
- Features P0: X
- Features P1: X
- Features P2: X
```

## Ejemplo con RICE

```
## Priorización RICE — Features MVP

| # | Feature | Reach | Impact | Confidence | Effort | Score | Prioridad |
|---|---------|-------|--------|------------|--------|-------|-----------|
| 1 | Onboarding | 1000 | 2 | 100% | 2 | 1000 | P0 |
| 2 | Filtros avanzados | 800 | 1 | 80% | 3 | 213 | P1 |
| 3 | Notificaciones push | 600 | 1 | 80% | 5 | 96 | P1 |
| 4 | Modo offline | 400 | 0.5 | 50% | 13 | 8 | P2 |
| 5 | Gamificación | 200 | 0.5 | 50% | 13 | 4 | P2 |
```

## Quick Wins

Identificar features que:
- Alto impacto + bajo esfuerzo
- Se pueden implementar rápido
- Dan valor inmediato al usuario

```
## Quick Wins Identificados

| # | Feature | Impacto | Esfuerzo | Valor |
|---|---------|---------|----------|-------|
| 1 | Compartir WhatsApp | Alto | 1 día | Alto |
| 2 | Deep links Maps | Alto | 1 día | Alto |
| 3 | Loading states | Medio | 1 día | Medio |
```
