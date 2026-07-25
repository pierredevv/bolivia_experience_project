---
name: ux-review-component
description: >
  Revisión detallada de un componente UI específico.
  Ejecuta al invocar /ux-review-component.
---

# UX: Revisión de Componente

## Propósito

Evaluar un componente UI individual contra el Design System del proyecto, verificando sus estados visuales, consistencia de tokens, reusabilidad y accesibilidad.

## Protocolo

### Paso 1: Identificar Componente
El usuario debe especificar:
- Nombre del componente
- Archivo donde está implementado
- Plataforma (Flutter Mobile / React Web)

### Paso 2: Leer Código y Documentación
1. Leer el archivo fuente del componente.
2. Leer `docs/design/3.1-design-tokens.md` y `docs/design/3.2-component-library.md`.
   > **Fallback**: Si algún archivo de `docs/design/` no existe, usar como fallback directo la sección **Design Tokens del Proyecto** en `SKILL.md` (o `AGENT.md`).
3. Identificar props/parámetros, estados visuales e interfaz de eventos.

### Paso 3: Evaluar Dimensiones

| Dimensión | Aspectos a Evaluar |
|-----------|--------------------|
| **Diseño Visual** | Alineación, jerarquía, tipografía, bordes y sombras |
| **Estados Visuales** | Default, hover, pressed/active, disabled, loading, error, empty |
| **Consistencia** | Cumplimiento estricto de Design Tokens (colores, espaciados en escala 4px) |
| **Accesibilidad** | Touch target mínimo (44x44 / 48x48px), contraste, labels/ARIA, focus state |
| **Reusabilidad** | Ausencia de lógica/valores hardcodeados, props parametrizables |
| **Responsividad** | Adaptabilidad a diferentes anchos de contenedor o pantallas |

### Paso 4: Formatear Resultado

```
## Revisión — [Nombre del Componente]

### Información General
- **Componente**: [Nombre]
- **Archivo**: [Path del archivo]
- **Plataforma**: [Flutter Mobile / React Web]

### Props / Parámetros
| Prop | Tipo | Default | Requerido | Descripción |
|------|------|---------|-----------|-------------|

### Cobertura de Estados Visuales
| Estado | ¿Implementado? | ¿Correcto? | Observaciones |
|--------|----------------|------------|---------------|
| Default | ✅/❌ | ✅/❌ | |
| Hover | ✅/❌ | ✅/❌ | |
| Active / Pressed | ✅/❌ | ✅/❌ | |
| Disabled | ✅/❌ | ✅/❌ | |
| Loading | ✅/❌ | ✅/❌ | |
| Error | ✅/❌ | ✅/❌ | |

### Consistencia con Design System
| Token | ¿Cumple? | Valor Actual | Valor Esperado |
|-------|----------|--------------|----------------|
| Color | ✅/❌ | | |
| Espaciado | ✅/❌ | | |
| Border Radius | ✅/❌ | | |

### Accesibilidad (WCAG 2.1 AA)
| Criterio | Estado | Notas |
|----------|--------|-------|
| Touch target ($\ge$ 44x44 / 48x48px) | ✅/❌ | |
| Label / ARIA | ✅/❌ | |
| Contraste ($\ge$ 4.5:1 / 3:1) | ✅/❌ | |
| Focus visible | ✅/❌ | |

### Issues Encontrados
| # | Severidad | Issue | Solución Recomendada |
|---|-----------|-------|----------------------|

### Recomendaciones Prioritarias
1. [Recomendación 1]
2. [Recomendación 2]
```

## Checklist de Componente

### Flutter
- [ ] Usa Design Tokens (`AppColors`, `TextStyles`, `AppSpacing`)
- [ ] Soporta Dark Mode correctamente
- [ ] Implementa todos los estados (default, pressed, disabled, loading)
- [ ] Touch target mínimo $\ge$ 44x44px (iOS) / 48x48px (Android)
- [ ] Etiquetas accesibles (`Semantics` / `tooltip`)
- [ ] Ratio de contraste adecuado

### React / Web
- [ ] Usa Design Tokens (variables CSS / clases Tailwind estandarizadas)
- [ ] Soporta Dark Mode (`dark:` classes)
- [ ] Implementa todos los estados (default, hover, focus, active, disabled)
- [ ] Touch target mínimo $\ge$ 44x44px
- [ ] Atributos ARIA (`aria-label`, `aria-expanded`, `aria-hidden`)
- [ ] Indicador de foco visible (`focus-visible:ring-2`)
- [ ] Operable por teclado (teclas Enter, Space, Escape)

## Ejemplo

```markdown
## Revisión — PrimaryButton.tsx

### Cobertura de Estados Visuales
| Estado | Implementado | Correcto | Observaciones |
|--------|--------------|----------|---------------|
| Default | ✅ | ✅ | Usa `primary-700` (#43A047) |
| Loading | ✅ | ⚠️ | El spinner rompe la altura del botón |

### Score del Componente: 8.5/10
```
