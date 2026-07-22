---
name: qa-release-checklist
description: >
  Checklist completo antes de cada release.
  Ejecuta al invocar /qa-release-checklist.
---

# QA: Checklist de Release

## Propósito

Verificar que todo está listo antes de hacer release a producción.

## Protocolo

### Paso 1: Identificar Versión
El usuario debe especificar:
- Número de versión (ej: 1.0.0)
- Tipo de release (Major/Minor/Patch)
- Fecha target

### Paso 2: Verificar Cada Categoría

#### Funcionalidades
| # | Feature | Estado | Notas |
|---|---------|--------|-------|
| 1 | Onboarding | ⬜ | |
| 2 | Login/Registro | ⬜ | |
| 3 | Google OAuth | ⬜ | |
| 4 | Home | ⬜ | |
| 5 | Búsqueda | ⬜ | |
| 6 | Mapa | ⬜ | |
| 7 | Detalle lugar | ⬜ | |
| 8 | Favoritos | ⬜ | |
| 9 | Reseñas | ⬜ | |
| 10 | Perfil | ⬜ | |

#### Testing
| # | Tipo | Estado | Cobertura |
|---|------|--------|-----------|
| 1 | Unit Tests API | ⬜ | X% |
| 2 | Unit Tests Web | ⬜ | X% |
| 3 | E2E Tests | ⬜ | X flujos |
| 4 | Manual Testing | ⬜ | X pantallas |

#### Performance
| # | Métrica | Target | Actual | ✅/❌ |
|---|---------|--------|--------|-------|
| 1 | API response time | < 200ms | Xms | |
| 2 | Web bundle size | < 500KB | XKB | |
| 3 | Flutter app size | < 50MB | XMB | |
| 4 | Cold start | < 3s | Xs | |

#### Seguridad
| # | Check | Estado | Notas |
|---|-------|--------|-------|
| 1 | JWT tokens | ⬜ | |
| 2 | CORS configurado | ⬜ | |
| 3 | Rate limiting | ⬜ | |
| 4 | Input validation | ⬜ | |
| 5 | Secrets no expuestos | ⬜ | |

#### Deployment
| # | Step | Estado | Notas |
|---|------|--------|-------|
| 1 | Docker build | ⬜ | |
| 2 | CI passing | ⬜ | |
| 3 | Staging deploy | ⬜ | |
| 4 | Smoke tests staging | ⬜ | |
| 5 | Production deploy | ⬜ | |
| 6 | Post-deploy verify | ⬜ | |

### Paso 3: Formatear Resultado

```
## Release Checklist — v[X.X.X]

### Resumen
- Fecha target: [fecha]
- Tipo: [Major/Minor/Patch]
- Estado: [GO / NO GO]

### Funcionalidades
| # | Feature | Estado | Notas |
|---|---------|--------|-------|

### Testing
| # | Tipo | Estado | Cobertura |
|---|------|--------|-----------|

### Performance
| # | Métrica | Target | Actual | Estado |
|---|---------|--------|--------|--------|

### Seguridad
| # | Check | Estado | Notas |
|---|-------|--------|-------|

### Deployment
| # | Step | Estado | Notas |
|---|------|--------|-------|

### Issues Bloqueantes
| # | Issue | Severidad | Fix |
|---|-------|-----------|-----|

### Decisión
- [ ] GO — Todo listo
- [ ] NO GO — Issues pendientes: [lista]

### Rollback Plan
1. [Paso 1 del rollback]
2. [Paso 2 del rollback]
```

## Criterios de GO

### Todos estos deben ser TRUE:
- [ ] 0 issues críticos abiertos
- [ ] < 3 issues mayores abiertos
- [ ] Tests passing (> 95%)
- [ ] Performance dentro de targets
- [ ] Security checks passing
- [ ] CI/CD passing
- [ ] Staging verificado
- [ ] Rollback plan documentado

## Formato de Rollback

```
## Rollback Plan — v[X.X.X]

### Si hay issues críticos post-deploy:

#### API
1. Revertir a versión anterior en Cloud Run
2. Verificar DB compatibility
3. Notificar al equipo

#### Web
1. Revertir deploy en Cloud Run
2. Limpiar CDN cache
3. Verificar funcionamiento

#### Flutter
1. Subir versión anterior a Play Store
2. Forzar update si es necesario
3. Notificar a usuarios
```
