---
name: ux-accessibility
description: >
  Auditoría de accesibilidad bajo el estándar WCAG 2.1 AA para componentes o pantallas.
  Ejecuta al invocar /ux-accessibility.
---

# UX: Auditoría de Accesibilidad (WCAG 2.1 AA)

## Propósito

Auditar pantallas y componentes bajo el estándar internacional de accesibilidad WCAG 2.1 Nivel AA, garantizando que el producto sea utilizable por personas con diversas discapacidades (visuales, motoras, cognitivas) y compatible con tecnologías asistivas.

## Protocolo

### Paso 1: Identificar Target
El usuario debe especificar:
- Nombre del componente o pantalla
- Archivo fuente (Web / Flutter)
- Dispositivos objetivo (Mobile / Desktop)

### Paso 2: Evaluar Criterios WCAG 2.1 AA

#### 1. Contraste de Color (Criterio 1.4.3 & 1.4.11)
- **Texto Normal** (< 18pt / 24px regular): Ratio de contraste mínimo **4.5:1** contra el fondo.
- **Texto Grande** ($\ge$ 18pt / 24px regular o $\ge$ 14pt / 19px bold): Ratio de contraste mínimo **3.0:1**.
- **Componentes UI e Iconos Informativos**: Ratio de contraste mínimo **3.0:1**.

#### 2. Tamaños de Touch Targets (Criterio 2.5.5)
- **iOS / Web Móvil**: Mínimo **44x44px** de área interactiva pulsable.
- **Android**: Mínimo **48x48px** de área interactiva pulsable.
- Espaciado suficiente entre botones contiguos para evitar pulsaciones erróneas.

#### 3. Semántica y Atributos ARIA (Criterio 1.3.1 & 4.1.2)
- Formulario e Inputs: Todos los campos deben contar con una etiqueta visible o atributos `aria-label` / `aria-labelledby`.
- Iconos Decorativos: Tienen `aria-hidden="true"` (Web) o `ExcludeSemantics` (Flutter).
- Iconos Interactivos / Botones de solo icono: Cuentan con `aria-label` descriptivo o `tooltip`.
- Estructura de Encabezados: Orden jerárquico lógico (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`).

#### 4. Navegación por Teclado y Focus (Criterio 2.1.1, 2.4.3, 2.4.7)
- Secuencia de Tabulación Lógica: `tabindex` correcto sin trampas de foco.
- Indicador de Foco Visible: Estilo de `focus-visible` perceptible (mínimo 2px outline con contraste 3:1).
- Skip Links: Enlace para saltar directamente al contenido principal (`.skip-link`).

### Paso 3: Formatear Resultado

```
## Reporte de Accesibilidad WCAG 2.1 AA — [Nombre de Pantalla/Componente]

### Información General
- **Target**: [Nombre/Path]
- **Plataforma**: [Flutter / React Web]
- **Cumplimiento Estándar**: [Conforme / Conforme Parcial / No Conforme]

### 1. Contraste de Color (Ratio mínimo 4.5:1 / 3:1)
| Elemento | Color Texto | Color Fondo | Ratio Calculado | Estado | Solución Sugerida |
|----------|-------------|-------------|-----------------|--------|-------------------|
| Botón Secundario | `#94A3B8` | `#FFFFFF` | 2.5:1 | ❌ Fallo | Cambiar texto a `#64748B` (4.6:1) |

### 2. Tamaños de Touch Target (Mínimo 44x44px / 48x48px)
| Elemento | Tamaño Actual | Tamaño Requerido | Estado | Solución Sugerida |
|----------|---------------|------------------|--------|-------------------|
| Botón Cerrar Modal | 32x32px | 44x44px | ❌ Fallo | Incrementar padding a `p-3` |

### 3. Semántica ARIA y Etiquetas
| Elemento | Atributo Actual | Estado | Solución Sugerida |
|----------|-----------------|--------|-------------------|
| Input Búsqueda | Sin label ni aria-label | ❌ Fallo | Añadir `aria-label="Buscar lugares"` |

### 4. Navegación por Teclado y Focus State
| Elemento | Tab Order | Focus Visible | Estado |
|----------|-----------|---------------|--------|
| Botón Filtros | Lógico | ❌ Ausente | Añadir clase `focus-visible:ring-2` |

### Checklist WCAG 2.1 AA
- [ ] 1.1.1 Non-text Content: Alt text / aria-label en imágenes e iconos
- [ ] 1.3.1 Info and Relationships: Estructura semántica correcta
- [ ] 1.4.3 Contrast (Minimum): Contraste texto 4.5:1 / componentes 3:1
- [ ] 1.4.4 Resize Text: Texto soporta escalado de 200%
- [ ] 2.1.1 Keyboard: Operable totalmente por teclado
- [ ] 2.4.1 Bypass Blocks: Mecanismo para saltar bloques de navegación
- [ ] 2.4.3 Focus Order: Orden de focus lógico
- [ ] 2.4.7 Focus Visible: Indicador de foco claramente perceptible
- [ ] 2.5.5 Target Size: Objetos táctiles $\ge$ 44x44px / 48x48px
- [ ] 3.3.1 Error Identification: Identificación clara de errores

### Recomendaciones Prioritarias
1. [Corrección crítica de accesibilidad]
2. [Segunda mejora]
```

## Checklist de Accesibilidad (WCAG 2.1 AA)

- [ ] **1.1.1 Non-text Content**: Alt text para imágenes / `aria-label` para botones con icono.
- [ ] **1.3.1 Info and Relationships**: Uso de marcas semánticas HTML5 (`header`, `main`, `nav`) / Semantics en Flutter.
- [ ] **1.4.3 Contrast (Minimum)**: Ratio mínimo 4.5:1 en texto normal y 3:1 en texto grande/UI.
- [ ] **1.4.4 Resize Text**: Permite escalar fuentes al 200% sin ruptura de layout.
- [ ] **2.1.1 Keyboard**: Toda funcionalidad es accesible mediante teclado.
- [ ] **2.4.1 Bypass Blocks**: Enlace de salto a contenido principal presente.
- [ ] **2.4.3 Focus Order**: La navegación con tecla Tab sigue una secuencia lógica.
- [ ] **2.4.7 Focus Visible**: El foco del teclado es visible de forma clara en todos los componentes interactivos.
- [ ] **2.5.5 Target Size**: Las zonas táctiles cumplen 44x44px (iOS/Web) o 48x48px (Android).
- [ ] **3.3.1 Error Identification**: Los errores de formulario indican claramente el campo afectado y la causa.

## Ejemplo

```markdown
## Reporte de Accesibilidad WCAG 2.1 AA — Input.tsx

### Hallazgos Clave
| # | Criterio | Issue | Solución |
|---|----------|-------|----------|
| 1 | 2.5.5 Target Size | Icono de ojo para mostrar password mide 24x24px | Añadir padding invisible para alcanzar 44x44px |
| 2 | 1.4.3 Contrast | Texto helper en `#A1A1AA` sobre blanco (2.8:1) | Cambiar a `#71717A` (4.6:1) |
```
