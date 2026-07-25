---
name: ux-audit
description: >
  Auditoría de usabilidad completa para una pantalla o flujo.
  Ejecuta al invocar /ux-audit.
---

# UX: Auditoría de Usabilidad

## Propósito

Evaluar una pantalla o flujo completo contra las 10 heurísticas de usabilidad de Nielsen, identificando issues que degraden la experiencia del usuario y proponiendo soluciones respaldadas en estándares.

## Protocolo

### Paso 1: Identificar Target
El usuario debe especificar:
- Nombre de la pantalla o flujo
- Archivo o ruta del código fuente
- Plataforma (Flutter Mobile / React Web)
- Contexto y perfil de usuario

### Paso 2: Leer Código y Documentación
1. Leer `handoff.md` para contexto del proyecto.
2. Leer la documentación en `docs/design/` (`3.1-design-tokens.md`, `3.2-component-library.md`, `3.3-dark-light-mode.md`, `3.6-user-flow.md`).
   > **Fallback**: Si algún archivo de `docs/design/` no existe, usar como fallback la sección **Design Tokens del Proyecto** en `SKILL.md` (o `AGENT.md`).
3. Leer el archivo de la pantalla y sus componentes hijos.

### Paso 3: Evaluar Contra Criterios

#### Heurísticas de Nielsen (10 principios)

| # | Heurística | Pregunta de Evaluación |
|---|------------|------------------------|
| 1 | Visibilidad del estado del sistema | ¿El usuario siempre sabe qué está pasando (loading, empty, error states)? |
| 2 | Match entre sistema y mundo real | ¿El lenguaje, iconografía y metáforas son naturales y comprensibles? |
| 3 | Control y libertad del usuario | ¿Puede deshacer acciones, regresar o cancelar sin perder estado? |
| 4 | Consistencia y estándares | ¿Es consistente con el Design System y convenciones de la plataforma? |
| 5 | Prevención de errores | ¿Previene errores mediante validaciones proactivas e indicaciones claras? |
| 6 | Reconocimiento sobre memorización | ¿Las opciones y acciones son visibles sin requerir memorización? |
| 7 | Flexibilidad y eficiencia de uso | ¿Existen atajos o flujos optimizados para usuarios frecuentes? |
| 8 | Estética y diseño minimalista | ¿La interfaz está libre de ruido visual e información irrelevante? |
| 9 | Diagnóstico y recuperación de errores | ¿Los mensajes de error son claros, amigables e indican cómo solucionarlo? |
| 10 | Ayuda y documentación | ¿Hay tooltips, textos de ayuda o asistencia visible si es necesario? |

### Paso 4: Formatear Resultado

```
## Auditoría UX — [Nombre de Pantalla]

### Información General
- **Pantalla**: [Nombre]
- **Plataforma**: [Flutter Mobile / React Web]
- **Archivo**: [Path del archivo]

### Issues Críticos (Bloquean experiencia o flujo)
| # | Heurística | Issue Encontrado | Ubicación | Solución Propuesta |
|---|------------|------------------|-----------|--------------------|

### Issues Importantes (Degradan UX)
| # | Heurística | Issue Encontrado | Ubicación | Solución Propuesta |
|---|------------|------------------|-----------|--------------------|

### Issues Menores (Polish)
| # | Heurística | Issue Encontrado | Ubicación | Solución Propuesta |
|---|------------|------------------|-----------|--------------------|

### Evaluación de Flujos Secundarios
| Flujo | ¿Estado Actual? | Issues |
|-------|-----------------|--------|

### Recomendaciones Prioritarias
1. [Solución prioritaria]
2. [Segunda solución]
3. [Tercera solución]

### Score de Usabilidad
- General: X/10
- Eficiencia: X/10
- Consistencia: X/10
- Accesibilidad: X/10
```

## Checklist Rápido de Auditoría

### Visual & Layout
- [ ] Jerarquía visual clara y contraste de elementos
- [ ] Espaciado en escala de 4px y ritmo constante
- [ ] Colores de la paleta oficial (primary-700, secondary-700, neutrals)
- [ ] Tipografía legible (`Inter`) en escala estandarizada

### Interacción & Feedback
- [ ] Zonas táctiles / Touch targets $\ge$ 44x44px (iOS/Web) o 48x48px (Android)
- [ ] Feedback inmediato en acciones (hover, active, disabled)
- [ ] Estados de carga (Skeleton / Loading Spinner) presentes
- [ ] Estados vacíos (*empty states*) informativos con CTA

### Navegación
- [ ] Estructura clara y botón de retorno funcional
- [ ] Mantenimiento del estado tras navegación

### Accesibilidad
- [ ] Contraste de texto $\ge$ 4.5:1 / componentes $\ge$ 3:1
- [ ] Labels/ARIA presentes en todos los inputs
- [ ] Focus visualmente identificable

## Ejemplo

```markdown
## Auditoría UX — Home Screen (Flutter)

### Issues Críticos
| # | Heurística | Issue Encontrado | Ubicación | Solución Propuesta |
|---|------------|------------------|-----------|--------------------|
| 1 | Visibilidad estado | Sin indicador de carga inicial | L45 | Implementar Skeleton view durante la petición |

### Score de Usabilidad: 7/10
```
