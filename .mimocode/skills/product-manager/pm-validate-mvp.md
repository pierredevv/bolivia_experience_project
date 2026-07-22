---
name: pm-validate-mvp
description: >
  Validar si una feature es necesaria para el MVP o puede postergarse.
  Ejecuta al invocar /pm-validate-mvp.
---

# PM: Validar MVP

## Propósito

Determinar si una feature específica es CRÍTICA para el MVP o puede implementarse en fases posteriores.

## Protocolo

### Paso 1: Recopilar Información
1. Recibir nombre/descripción de la feature
2. Leer `docs/business/1.5-mvp-hipotesis-metricas-validacion.md`
3. Leer `docs/business/1.9-roadmap-completo.md`

### Paso 2: Evaluar contra Criterios MVP

| Criterio | Pregunta |
|----------|----------|
| **Core Value** | ¿Resuelve el problema principal del usuario? |
| **Dependency** | ¿Otras features críticas dependen de esta? |
| **Metric Impact** | ¿Impacta métricas North Star del MVP? |
| **User Journey** | ¿Es parte del flujo principal del usuario? |
| **Competitive** | ¿Sin esto la app es poco usable? |

### Paso 3: Formatear Resultado

```
## Validación MVP — [Feature]

### Veredicto: [CRÍTICO / IMPORTANTE / POSTERGAR]

### Análisis

| Criterio | Evaluación | Notas |
|----------|------------|-------|
| Core Value | ✅/⚠️/❌ | [justificación] |
| Dependency | ✅/⚠️/❌ | [justificación] |
| Metric Impact | ✅/⚠️/❌ | [justificación] |
| User Journey | ✅/⚠️/❌ | [justificación] |
| Competitive | ✅/⚠️/❌ | [justificación] |

### Justificación
[Por qué sí o por qué no]

### Dependencias
- Requiere: [features que necesita]
- Bloquea: [features que bloquea]

### Alternativa si se posterga
[Cómo cubrir la funcionalidad sin ella]

### Recomendación
[Acción sugerida con prioridad]
```

## Categorías de Validación

### CRÍTICO (P0) — Sin esto no hay MVP
- Onboarding
- Login/Registro
- Home con contenido
- Búsqueda básica
- Mapa interactivo
- Detalle del lugar
- Favoritos
- Reseñas básicas
- Panel Admin básico

### IMPORTANTE (P1) — Necesario para buena UX
- Filtros avanzados
- Notificaciones push
- Compartir
- Deep links
- i18n
- Loading states

### POSTERGAR (P2) — Nice to have
- Modo offline
- Gamificación
- Chat
- IA/ML
- Realidad aumentada

## Ejemplo

```
## Validación MVP — Widget de Clima

### Veredicto: POSTERGAR

### Análisis

| Criterio | Evaluación | Notas |
|----------|------------|-------|
| Core Value | ⚠️ | No resuelve problema principal |
| Dependency | ❌ | Ninguna feature depende |
| Metric Impact | ⚠️ | No impacta North Star |
| User Journey | ⚠️ | No es parte del flujo core |
| Competitive | ⚠️ | No es diferenciador crítico |

### Justificación
El widget de clima es un feature "nice to have" que agrega valor percibido pero no es esencial para el MVP. Los usuarios pueden usar apps de clima separadas.

### Dependencias
- Requiere: API de OpenWeatherMap
- Bloquea: Ninguna

### Alternativa si se posterga
No implementar. Los usuarios pueden consultar el clima por separado.

### Recomendación
Postergar a Fase 2. Enfocar recursos en features críticas del MVP.

### Prioridad: P2 — Fase 2
```
