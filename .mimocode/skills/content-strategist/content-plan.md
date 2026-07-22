---
name: content-plan
description: >
  Planificar contenido faltante para el proyecto.
  Ejecuta al invocar /content-plan.
---

# Content: Plan de Contenido

## Propósito

Identificar todo el contenido faltante y crear un plan para producirlo.

## Protocolo

### Paso 1: Definir Alcance
El usuario debe especificar:
- Contexto (landing, app, email, docs)
- Prioridad (crítico, importante, nice to have)
- Timeline

### Paso 2: Auditar Contenido Existente
1. Revisar archivos de contenido
2. Identificar textos hardcodeados
3. Verificar traducciones
4. Evaluar calidad

### Paso 3: Planificar Contenido Faltante
1. Listar todo el contenido necesario
2. Priorizar por impacto
3. Estimar esfuerzo
4. Crear timeline

### Paso 4: Formatear Resultado

```
## Plan de Contenido — [Contexto]

### Resumen
- Contenido existente: X items
- Contenido faltante: X items
- Esfuerzo total: X horas
- Timeline: X semanas

### Contenido Crítico (P0)
| # | Ubicación | Tipo | Copy | Responsable | Fecha |
|---|-----------|------|------|-------------|-------|

### Contenido Importante (P1)
| # | Ubicación | Tipo | Copy | Responsable | Fecha |
|---|-----------|------|------|-------------|-------|

### Contenido Nice to Have (P2)
| # | Ubicación | Tipo | Copy | Responsable | Fecha |
|---|-----------|------|------|-------------|-------|

### Timeline
| Semana | Entregable | Estado |
|--------|------------|--------|

### Recursos Necesarios
| Recurso | Cantidad | Costo |
|---------|----------|-------|

### Dependencias
| Contenido | Requiere | Bloquea |
|-----------|----------|---------|
```

## Checklist de Contenido

### Landing Page
- [ ] Título hero (ES/EN)
- [ ] Subtítulo hero (ES/EN)
- [ ] CTA principal (ES/EN)
- [ ] 6 features (título + descripción)
- [ ] 3 pasos "How It Works"
- [ ] 3 testimonios
- [ ] 8 FAQs
- [ ] Footer links
- [ ] Meta tags SEO

### App Flutter
- [ ] 3 pantallas onboarding
- [ ] Títulos de secciones
- [ ] Empty states (10+)
- [ ] Error messages (10+)
- [ ] Loading messages
- [ ] Botones y acciones
- [ ] Tooltips

### Email
- [ ] Asunto verificación
- [ ] Body verificación
- [ ] Asunto bienvenida
- [ ] Body bienvenida
- [ ] Asunto password reset
- [ ] Body password reset

### Panel Admin
- [ ] Títulos de páginas
- [ ] Mensajes de éxito/error
- [ ] Confirmaciones de acción
- [ ] Empty states

### Panel Empresa
- [ ] Títulos de páginas
- [ ] Mensajes de éxito/error
- [ ] Guías de uso
- [ ] Empty states

## Ejemplo

```
## Plan Contenido — App Flutter

### Resumen
- Contenido existente: 15 items
- Contenido faltante: 35 items
- Esfuerco total: 20 horas
- Timeline: 2 semanas

### Contenido Crítico (P0)
| # | Ubicación | Tipo | Copy | Fecha |
|---|-----------|------|------|-------|
| 1 | Onboarding 1 | Título | "Descubre lugares increíbles" | Día 1 |
| 2 | Onboarding 1 | Subtítulo | "Explora lo mejor de Santa Cruz" | Día 1 |
| 3 | Onboarding 2 | Título | "Guarda tus favoritos" | Día 1 |
| 4 | Onboarding 2 | Subtítulo | "Crea tu lista personal" | Día 1 |
| 5 | Onboarding 3 | Título | "Comparte con amigos" | Día 1 |
| 6 | Onboarding 3 | Subtítulo | "Recomienda lugares geniales" | Día 1 |
| 7 | Home | Search bar | "¿Qué estás buscando?" | Día 2 |
| 8 | Home | Sección | "Lugares Destacados" | Día 2 |

### Timeline
| Semana | Entregable | Estado |
|--------|------------|--------|
| 1 | Onboarding + Home | ⬜ |
| 2 | Errores + Empty States | ⬜ |
```
