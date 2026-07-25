---
name: ux-check-consistency
description: >
  Auditar el código fuente frente a los Design Tokens del proyecto para detectar inconsistencias visuales.
  Ejecuta al invocar /ux-check-consistency.
---

# UX: Verificación de Consistencia Visual

## Propósito

Auditar el código fuente frente a los Design Tokens oficializados del proyecto para detectar colores hardcodeados, variaciones de color no autorizadas, tipografías fuera de escala, espaciados arbitrarios e inconsistencias visuales.

## Protocolo

### Paso 1: Identificar Target
El usuario debe especificar:
- Nombre del componente, pantalla o módulo a auditar
- Archivo(s) o directorio
- Plataforma (Flutter / React Web)

### Paso 2: Cargar Design Tokens (con Fallback)
1. Intentar leer `docs/design/3.1-design-tokens.md`.
2. **Fallback**: Si el archivo no existe, utilizar directamente la sección **Design Tokens del Proyecto** definida en `SKILL.md` (o `AGENT.md`).

### Paso 3: Auditar Código Fuente
Examinar el código buscando discrepancias en las siguientes categorías:

1. **Colores**:
   - Detectar valores HEX, RGB o clases de Tailwind hardcodeadas en lugar de clases/tokens semánticos (`primary-700`, `secondary-700`, `neutral-X`).
   - Verificar uso correcto de colores de marca (`brand-red`, `brand-orange`, `brand-yellow`, `brand-green`, `brand-blue`).
2. **Tipografía**:
   - Comprobar que los tamaños de fuente pertenecen a la escala estandarizada de 13 niveles.
   - Verificar familias tipográficas (`Inter`) y pesos autorizados (400, 500, 600, 700, 800).
3. **Espaciados**:
   - Validar que padding, margin y gaps respetan la escala base de 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64).
4. **Bordes y Radio**:
   - Confirmar uso de tokens de border-radius (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`).
5. **Sombras y Elevación**:
   - Validar el uso del sistema de elevación (`elevation-1` a `elevation-6` / `AppShadows`).
6. **Iconografía & Componentes**:
   - Verificar consistencia del set de iconos (Lucide icons / Material icons) y estilos de líneas.

### Paso 4: Formatear Resultado

```
## Reporte de Consistencia Visual — [Pantalla/Componente]

### Información General
- **Target**: [Nombre/Path del archivo]
- **Plataforma**: [Flutter / React Web]
- **Cumplimiento Global**: [X%]

### Tokens No Estandarizados (Valores Hardcodeados)
| # | Categoria | Valor Encontrado | Ubicación (Línea) | Token Sugerido | Estado |
|---|-----------|------------------|-------------------|----------------|--------|
| 1 | Color | `#43a047` | L45 | `primary-700` | 🔴 Reemplazar |
| 2 | Espaciado | `p-[13px]` | L78 | `p-3` (12px) o `p-4` (16px) | 🔴 Corregir |

### Checklist de Consistencia Visual
- [ ] Todos los colores provienen de la paleta de tokens
- [ ] Los tamaños de texto pertenecen a la escala tipográfica estandarizada
- [ ] Los espaciados son múltiplos de 4px
- [ ] Los border-radius respetan los tokens definidos
- [ ] Las sombras corresponden al sistema de elevación
- [ ] Los iconos pertenecen al mismo set (Lucide / Material)
- [ ] Soporte consistente para Dark/Light mode

### Recomendaciones de Refactorización Visual
1. [Recomendación prioritaria de estandarización]
2. [Segunda recomendación]
```

## Checklist de Consistencia Visual

- [ ] **Colores**: Cero valores Hex/RGB inline no registrados en los tokens.
- [ ] **Tipografía**: Respeto a los 13 tamaños de escala e interlineados estandarizados.
- [ ] **Espaciados**: Múltiplos de 4px en toda la vista (`gap`, `padding`, `margin`).
- [ ] **Bordes**: Esquinas y border-width consistentes entre componentes similares.
- [ ] **Sombras**: Niveles de elevación acordes a la jerarquía de capas (cards, dropdowns, modales).
- [ ] **Dark Mode**: Soporte simétrico de tokens oscuros/claros sin parpadeos visuales.

## Ejemplo

```markdown
## Reporte de Consistencia Visual — Navbar.tsx

### Tokens No Estandarizados
| # | Categoria | Valor Encontrado | Ubicación | Token Sugerido | Estado |
|---|-----------|------------------|-----------|----------------|--------|
| 1 | Color | `#1565C0` inline | L68 | `secondary-800` | 🔴 Reemplazar |
| 2 | Espaciado | `gap-[18px]` | L78 | `gap-4` (16px) | 🔴 Corregir |

### Score de Consistencia: 85%
```
