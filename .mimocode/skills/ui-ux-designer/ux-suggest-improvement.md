---
name: ux-suggest-improvement
description: >
  Analizar pantallas o flujos completos e identificar oportunidades de mejora visual, interacción y contenido.
  Ejecuta al invocar /ux-suggest-improvement.
---

# UX: Sugerencias de Mejora

## Propósito

Analizar pantallas o flujos de usuario completos para identificar oportunidades de optimización en diseño visual, patrones de interacción y microcopy, priorizando las mejoras mediante una matriz de impacto vs. esfuerzo.

## Protocolo

### Paso 1: Identificar Target
El usuario debe especificar:
- Nombre de la pantalla o flujo
- Archivo o directorio fuente
- Plataforma (Web / Mobile)
- Objetivo del flujo (ej. Registro de usuario, proceso de compra, navegación principal)

### Paso 2: Analizar Experiencia Actual
1. Leer el código fuente de la vista y componentes relacionados.
2. Evaluar la arquitectura de la información y la claridad visual.
3. Identificar puntos de fricción, ambigüedades o falta de feedback.

### Paso 3: Categorizar Oportunidades de Mejora

#### 1. Visual
- **Jerarquía**: Contraste tipográfico, escala visual y peso de elementos.
- **Ritmo y Espaciado**: Uso de whitespace, alineación y consistencia con grid.
- **Densidad**: Nivel de ruido visual y simplicidad estética.

#### 2. Interacción
- **Eficiencia del Flujo**: Reducción de pasos, taps o clics necesarios.
- **Feedback**: Estados de carga, animaciones micro-interactivas y confirmaciones.
- **Manejo de Estados**: Estados vacíos (*empty states*), estados de error y sugerencias de recuperación.

#### 3. Contenido & Copywriting
- **Claridad de CTAs**: Verbos de acción directa en botones principales.
- **Microcopy**: Instrucciones concisas, placeholders útiles y mensajes amigables.
- **Tono y Voz**: Consistencia con la identidad del producto (BoliviaExperience).

### Paso 4: Construir Matriz de Mejoras
Clasificar cada propuesta según su relación **Impacto vs. Esfuerzo**:

| Matriz | Bajo Esfuerzo | Alto Esfuerzo |
|--------|---------------|---------------|
| **Alto Impacto** | 🚀 **Victorias Rápidas (Hacer Ahora)** | 📅 **Proyectos Clave (Planificar)** |
| **Bajo Impacto** | 🧹 **Polish Menor (Si hay tiempo)** | ⏳ **Descartar / Postponer** |

### Paso 5: Formatear Resultado

```
## Sugerencias de Mejora UX — [Nombre de Pantalla/Flujo]

### Resumen del Flujo
- **Pantalla/Flujo**: [Nombre]
- **Objetivo del Usuario**: [Meta principal]
- **Estado Actual**: [Descripción sintética de la experiencia actual]

### Matriz de Priorización (Impacto vs. Esfuerzo)
| # | Oportunidad | Categoría | Impacto | Esfuerzo | Prioridad |
|---|-------------|-----------|---------|----------|-----------|
| 1 | [Descripción] | Visual/Interacción/Copy | Alto/Medio/Bajo | Alto/Medio/Bajo | Hacer Ahora / Planificar |

### Detalle de Propuestas de Mejora

#### 🚀 Victorias Rápidas (Hacer Ahora)
1. **[Título de Mejora]**
   - **Problema actual**: [Descripción breve]
   - **Propuesta**: [Solución concreta con ejemplo visual o de código]
   - **Beneficio esperado**: [Valor para el usuario]

#### 📅 Proyectos Clave (Planificar)
1. **[Título de Mejora]**
   - **Problema actual**: [Descripción breve]
   - **Propuesta**: [Solución estructurada]
   - **Beneficio esperado**: [Valor para el usuario]

### Checklist de Valor para el Usuario
- [ ] ¿Reduce el esfuerzo cognitivo del usuario?
- [ ] ¿Aumenta la claridad de las acciones principales (CTAs)?
- [ ] ¿Mejora la velocidad o eficiencia de la tarea?
- [ ] ¿Mantiene coherencia con el Design System?
- [ ] ¿Respeta accesibilidad y contraste?
```

## Checklist de Valor para el Usuario

- [ ] **Simplicidad**: ¿Se eliminaron elementos decorativos innecesarios que generan ruido?
- [ ] **Claridad**: ¿Las llamadas a la acción (CTAs) son inequívocas?
- [ ] **Eficiencia**: ¿Se redujeron los pasos requeridos para completar la tarea principal?
- [ ] **Feedback**: ¿El usuario siempre sabe cuál fue el resultado de su acción?
- [ ] **Coherencia**: ¿Las propuestas se alinean con los tokens y patrones del Design System?

## Ejemplo

```markdown
## Sugerencias de Mejora UX — Pantalla de Detalle de Lugar (Web)

### Matriz de Priorización
| # | Oportunidad | Categoría | Impacto | Esfuerzo | Prioridad |
|---|-------------|-----------|---------|----------|-----------|
| 1 | Destacar botón "Cómo llegar" con icono de mapa | Interacción | Alto | Bajo | Hacer Ahora |
| 2 | Rediseñar la sección de Reseñas con filtro por estrellas | Visual | Alto | Medio | Planificar |

### Detalle de Propuestas

#### 🚀 Victorias Rápidas
1. **Destacar CTA de Navegación**
   - **Problema actual**: El botón de ubicación se pierde entre los botones secundarios.
   - **Propuesta**: Aplicar variante `primary-700` (#43A047) con icono `MapPin` a 20px.
   - **Beneficio esperado**: Aumenta la conversión de usuarios que buscan llegar al negocio.
```
