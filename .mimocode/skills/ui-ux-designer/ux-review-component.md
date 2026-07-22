---
name: ux-review-component
description: >
  Revisión detallada de un componente UI específico.
  Ejecuta al invocar /ux-review-component.
---

# UX: Revisión de Componente

## Propósito

Evaluar un componente UI individual contra el design system y estándares de usabilidad.

## Protocolo

### Paso 1: Identificar Componente
El usuario debe especificar:
- Nombre del componente
- Archivo donde está implementado
- Plataforma (Flutter/Web)

### Paso 2: Leer Código
1. Leer el archivo del componente
2. Identificar props/parámetros
3. Identificar estados
4. Verificar estilos

### Paso 3: Evaluar

#### Dimensiones de Evaluación

| Dimensión | Qué revisar |
|-----------|-------------|
| **Diseño** | Visual design, espaciado, colores, tipografía |
| **Estados** | Default, hover, active, disabled, loading, error |
| **Consistencia** | Cumple design tokens |
| **Accesibilidad** | Touch targets, labels, contraste |
| **Reusabilidad** | Es genérico o está hardcodeado |
| **Responsividad** | Funciona en diferentes tamaños |

### Paso 4: Formatear Resultado

```
## Revisión — [Nombre del Componente]

### Información
- Componente: [nombre]
- Archivo: [path]
- Plataforma: [Flutter/Web]

### Props/Parámetros
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|

### Estados
| Estado | ¿Implementado? | ¿Correcto? | Notas |
|--------|----------------|------------|-------|
| Default | ✅/❌ | ✅/❌ | |
| Hover | ✅/❌ | ✅/❌ | |
| Active | ✅/❌ | ✅/❌ | |
| Disabled | ✅/❌ | ✅/❌ | |
| Loading | ✅/❌ | ✅/❌ | |
| Error | ✅/❌ | ✅/❌ | |

### Consistencia con Design System
| Token | ¿Cumple? | Actual | Esperado |
|-------|----------|--------|----------|

### Accesibilidad
| Criterio | Estado | Notas |
|----------|--------|-------|
| Touch target (44x44px) | ✅/❌ | |
| Label/ARIA | ✅/❌ | |
| Contraste (4.5:1) | ✅/❌ | |
| Focus visible | ✅/❌ | |

### Issues Encontrados
| # | Severidad | Issue | Solución |
|---|-----------|-------|----------|

### Recomendaciones
1. [Prioritaria]
2. [Segunda]
```

## Checklist de Componente

### Flutter
- [ ] Usa Design Tokens (AppColors, TextStyles)
- [ ] Soporta dark mode
- [ ] Tiene todos los estados
- [ ] Touch target mínimo 44x44
- [ ] Labels accesibles
- [ ] Contraste suficiente

### React/Web
- [ ] Usa Design Tokens (CSS variables)
- [ ] Soporta dark mode
- [ ] Tiene todos los estados
- [ ] Touch target mínimo 44x44
- [ ] ARIA labels
- [ ] Focus states
- [ ] Keyboard navigation

## Ejemplo

```
## Revisión — Botón Primario (ElevatedButton)

### Props
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| onPressed | VoidCallback? | null | Acción al presionar |
| child | Widget | requerido | Contenido del botón |
| isLoading | bool | false | Estado de carga |

### Estados
| Estado | Implementado | Correcto | Notas |
|--------|--------------|----------|-------|
| Default | ✅ | ✅ | Color primary-700 |
| Hover | ✅ | ✅ | Color primary-600 |
| Active | ✅ | ✅ | Color primary-800 |
| Disabled | ✅ | ✅ | Opacity 0.5 |
| Loading | ✅ | ⚠️ | Falta spinner |

### Issues
| # | Severidad | Issue | Solución |
|---|-----------|-------|----------|
| 1 | Importante | Sin loading state | Agregar CircularProgressIndicator |

### Score: 8/10
```
