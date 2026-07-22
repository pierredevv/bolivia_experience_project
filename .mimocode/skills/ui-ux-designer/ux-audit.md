---
name: ux-audit
description: >
  Auditoría de usabilidad completa para una pantalla o flujo.
  Ejecuta al invocar /ux-audit.
---

# UX: Auditoría de Usabilidad

## Propósito

Evaluar una pantalla o flujo completo contra principios de usabilidad y encontrar issues que degarden la experiencia del usuario.

## Protocolo

### Paso 1: Identificar Target
El usuario debe especificar:
- Nombre de la pantalla/archivo
- Plataforma (Flutter/Web)
- Contexto de uso

### Paso 2: Leer Código
1. Leer el archivo de la pantalla
2. Leer componentes relacionados
3. Identificar widgets/componentses UI

### Paso 3: Evaluar Contra Criterios

#### Criterios de Nielsen (10 heurísticas)

| # | Heurística | Pregunta |
|---|------------|----------|
| 1 | Visibilidad del estado del sistema | ¿El usuario sabe qué está pasando? |
| 2 | Match entre sistema y mundo real | ¿El lenguaje es comprensible? |
| 3 | Control y libertad del usuario | ¿Puede deshacer/corregir? |
| 4 | Consistencia y estándares | ¿Es consistente con el resto? |
| 5 | Prevención de errores | ¿Previene errores comunes? |
| 6 | Reconocimiento sobre memorización | ¿Es obvio qué hacer? |
| 7 | Flexibilidad y eficiencia de uso | ¿Hay atajos para usuarios avanzados? |
| 8 | Estética y diseño minimalista | ¿Hay información irrelevante? |
| 9 | Ayudar a reconocer, diagnosticar y recuperar errores | ¿Los errores son claros? |
| 10 | Ayuda y documentación | ¿Hay ayuda disponible? |

### Paso 4: Formatear Resultado

```
## Auditoría UX — [Nombre de Pantalla]

### Información General
- Pantalla: [nombre]
- Plataforma: [Flutter/Web]
- Archivo: [path]

### Issues Críticos (Bloquean)
| # | Heurística | Issue | Impacto | Solución |
|---|------------|-------|---------|----------|

### Issues Importantes (Degradan)
| # | Heurística | Issue | Impacto | Solución |
|---|------------|-------|---------|----------|

### Issues Menores (Polish)
| # | Heurística | Issue | Impacto | Solución |
|---|------------|-------|---------|----------|

### Flujos Revisados
| Flujo | ¿Funcional? | Issues |
|-------|--------------|--------|

### Recomendaciones Prioritarias
1. [Más importante]
2. [Segunda]
3. [Tercera]

### Score de Usabilidad
- General: X/10
- Eficiencia: X/10
- Consistencia: X/10
- Accesibilidad: X/10
```

## Checklist Rápido

### Visual
- [ ] Jerarquía visual clara
- [ ] Espaciado consistente
- [ ] Colores consistentes con design system
- [ ] Tipografía legible
- [ ] Iconografía clara

### Interacción
- [ ] Touch targets mínimos (44x44px)
- [ ] Feedback visual en acciones
- [ ] Estados hover/active implementados
- [ ] Loading states presentes
- [ ] Empty states informativos

### Navegación
- [ ] Navegación clara y consistente
- [ ] Botón de regreso funciona
- [ ] Breadcrumbs si aplica
- [ ] Deep links funcionales

### Contenido
- [ ] Textos claros y concisos
- [ ] Error messages comprensibles
- [ ] Placeholders descriptivos
- [ ] Labels en todos los inputs

### Accesibilidad
- [ ] Contraste suficiente
- [ ] Labels/ARIA presentes
- [ ] Tamaño de fuente legible
- [ ] Focus states visibles

## Ejemplo

```
## Auditoría UX — Home Screen (Flutter)

### Issues Críticos
| # | Heurística | Issue | Impacto | Solución |
|---|------------|-------|---------|----------|
| 1 | Visibilidad estado | Sin loading state al cargar datos | Usuario no sabe si carga | Agregar skeleton loading |
| 2 | Match mundo real | Iconos sin tooltips | Usuario no entiende iconos | Agregar tooltips o labels |

### Issues Importantes
| # | Heurística | Issue | Impacto | Solución |
|---|------------|-------|---------|----------|
| 3 | Consistencia | Cards con bordes inconsistentes | Se ve descuidado | Estandarizar border-radius |
| 4 | Eficiencia | Sin pull-to-refresh visible | Usuario no sabe que puede recargar | Agregar indicador visual |

### Issues Menores
| # | Heurística | Issue | Impacto | Solución |
|---|------------|-------|---------|----------|
| 5 | Minimalismo | Título muy grande en AppBar | Ocupa espacio innecesario | Reducir a titleMedium |

### Score: 7/10
```
