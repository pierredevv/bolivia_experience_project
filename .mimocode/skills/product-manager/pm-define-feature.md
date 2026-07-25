---
name: pm-define-feature
description: >
  Definir una nueva feature con user story, criterios de aceptación,
  estimación y dependencias. Ejecuta al invocar /pm-define-feature.
---

# PM: Definir Feature

## Propósito

Crear una definición completa de una feature nueva que pueda ser implementada por el equipo de desarrollo.

## Formato de Entrada

El usuario debe proporcionar:
- Nombre de la feature
- Descripción breve (opcional)
- Contexto (opcional)

## Protocolo

### Paso 1: Contexto
1. Leer `handoff.md` para entender estado actual
2. Leer `docs/business/1.9-roadmap-completo.md` para roadmap
3. Identificar si la feature ya existe parcialmente

### Paso 2: Definición
Crear la feature con este formato:

```
## Feature: [Nombre]

### ID
FEAT-XXX

### User Story
Como [actor principal], quiero [funcionalidad específica] para [beneficio claro].

### Criterios de Aceptación
DADO [contexto]
CUANDO [acción]
ENTONCES [resultado esperado]

### Prioridad
- [ ] P0 — CRÍTICO (MVP)
- [ ] P1 — IMPORTANTE
- [ ] P2 — NICE TO HAVE

### Estimación
- Complejidad: Baja / Media / Alta
- Tiempo estimado: X días
- Story Points: X

### Dependencias
- Requiere: [lista de features que necesita]
- Bloquea: [lista de features que bloquea]
- Relacionado con: [features relacionadas]

### Plataforma
- [ ] Flutter (App móvil)
- [ ] React (Web Admin)
- [ ] React (Web Empresa)
- [ ] NestJS (API)
- [ ] Todos

### Notas Técnicas
[Consideraciones técnicas relevantes]

### Métricas de Éxito
- [Métrica 1]: [Target]
- [Métrica 2]: [Target]
```

### Paso 3: Validación
Verificar que la feature:
1. Está alineada con el roadmap
2. No duplica funcionalidad existente
3. Tiene dependencias claras
4. Es estimable

## Ejemplo

```
## Feature: Onboarding (3 pantallas)

### ID
FEAT-001

### User Story
Como turista nuevo, quiero ver 3 pantallas de bienvenida al abrir la app por primera vez para entender qué puedo hacer con la aplicación.

### Criterios de Aceptación
DADO que el usuario abre la app por primera vez
CUANDO la app carga
ENTONCES muestra pantalla 1 de 3 con título "Descubre lugares increíbles"

DADO que el usuario está en pantalla 1
CUANDO desliza a la izquierda
ENTONCES muestra pantalla 2 de 3

DADO que el usuario está en pantalla 3
CUANDO toca "Empezar"
ENTONCES navega a la pantalla de Login

DADO que el usuario completó el onboarding
CUANDO abre la app nuevamente
ENTONCES NO muestra el onboarding (guardado en SharedPreferences)

### Prioridad
- [x] P0 — CRÍTICO (MVP)

### Estimación
- Complejidad: Baja
- Tiempo estimado: 2 días
- Story Points: 3

### Dependencias
- Requiere: Ninguna
- Bloquea: FEAT-002 (Registro)
- Relacionado con: FEAT-003 (Login)

### Plataforma
- [x] Flutter (App móvil)

### Notas Técnicas
- Usar PageView con dots indicator
- Guardar flag en SharedPreferences
- Animaciones suaves entre páginas

### Métricas de Éxito
- Completado onboarding: > 70%
- Tiempo de completado: < 30 segundos
```
