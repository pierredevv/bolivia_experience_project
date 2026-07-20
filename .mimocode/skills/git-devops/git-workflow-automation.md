---
name: git-workflow
description: >
  Guía completa de flujo de trabajo Git: crear rama al iniciar, commits durante
  desarrollo, y PR al completar. Ejecuta al invocar /git-workflow.
---

# Git Workflow Automation — BoliviaExperience

## Propósito

Guiar al desarrollador en cada etapa del ciclo de vida de una feature o bugfix:
1. Al INICIAR → crear rama con nombre correcto
2. DURANTE el desarrollo → commits pequeños y descriptivos
3. Al COMPLETAR → preparar y crear Pull Request

---

## Etapa 1: Al INICIAR trabajo

### Pregunta obligatoria antes de crear rama

"¿Trabajás solo en esta feature o hay otro dev involucrado?"

- **Si solo** → rebase será seguro después
- **Si compartido** → merge será necesario al sincronizar con develop

### Rama Sugerida

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Nueva feature | `feature/{descripcion-corta}` | `feature/promotions-crud` |
| Bug fix | `fix/{descripcion-corta}` | `fix/dark-mode-admin` |
| Hotfix urgente | `hotfix/{descripcion-corta}` | `hotfix/auth-crash` |
| Release | `release/{version}` | `release/1.0.0` |
| Mantenimiento | `chore/{descripcion-corta}` | `chore/update-deps` |

### Convenciones de nombre

- Usar guiones `-` (no underscores ni espacios)
- Todo en minúsculas
- Descripción corta pero clara
- Incluir scope del módulo si aplica: `feature/auth-refresh-tokens`

### Comandos para crear rama

```bash
# 1. Asegurar que develop está actualizado
git checkout develop
git pull origin develop

# 2. Crear rama desde develop
git checkout -b feature/{descripcion}

# Verificar rama actual
git branch --show-current
```

### Checklist Inicial

- [ ] Rama creada desde develop (no desde main)
- [ ] Nombre sigue convención: feature/, fix/, hotfix/, release/, chore/
- [ ] develop está actualizado (git pull)
- [ ] No hay cambios sin commit en develop

---

## Etapa 2: Durante el desarrollo

### Commits Pequeños y Descriptivos

- Un commit por tarea lógica completa
- Mensaje claro que explique QUÉ hace el cambio
- NO: "fix stuff", "update", "wip", "asdf"

### Formato: Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos permitidos

| Type | Uso | Ejemplo |
|------|-----|---------|
| feat | Nueva feature | `feat(auth): add refresh token rotation` |
| fix | Bug fix | `fix(ui): add dark mode classes to Modal` |
| docs | Documentación | `docs(readme): update setup instructions` |
| style | Formato (no afecta código) | `style(web): fix indentation in Modal.tsx` |
| refactor | Reestructurar sin cambio funcional | `refactor(api): extract auth middleware` |
| test | Agregar/corregir tests | `test(auth): add login validation tests` |
| chore | Tareas de mantenimiento | `chore(db): add RefreshToken model to schema` |
| ci | Cambios en CI/CD | `ci(actions): add branch validation job` |
| build | Sistema de build | `build(flutter): update Gradle config` |
| perf | Mejoras de rendimiento | `perf(api): add index to reviews query` |
| revert | Revertir commit | `revert: feat(auth): add refresh token` |

### Scopes del proyecto

| Scope | Describe cambios en |
|-------|---------------------|
| auth | api/src/modules/auth/ |
| places | api/src/modules/places/ |
| reviews | api/src/modules/reviews/ |
| events | api/src/modules/events/ |
| promotions | api/src/modules/promotions/ |
| admin | api/src/modules/admin/ |
| empresa | api/src/modules/empresa/ |
| web | web/src/ |
| app | app/lib/ |
| db | api/prisma/ |
| ci | .github/workflows/ |
| docker | docker-compose.yml, Dockerfiles |

### Ejemplos de commits

```bash
git add api/src/modules/auth/auth.service.ts
git commit -m "feat(auth): add refresh token with DB storage"

git add web/src/components/Modal.tsx
git commit -m "fix(ui): add dark mode classes to Modal"

git add api/prisma/schema.prisma api/prisma/schema.sqlite.prisma
git commit -m "chore(db): add RefreshToken model to both schemas"

git add web/src/hooks/usePlaces.ts
git commit -m "fix(places): change category to categoryId parameter"
```

---

## Etapa 3: Al COMPLETAR trabajo

### Antes de crear PR

1. Verificar que no hay console.log en código de producción
2. Ejecutar tests localmente
3. Verificar que TypeScript compila sin errores
4. Actualizar rama con develop (según regla rebase vs merge)

### Regla: Rebase vs Merge

| Escenario | Estrategia | Comando |
|-----------|-----------|---------|
| Solo vos tocaste la rama | **Rebase** | `git rebase origin/develop` |
| Rama compartida o no sabés | **Merge** | `git merge origin/develop` |

### Comandos para preparar PR

```bash
# 1. Actualizar rama con develop
git fetch origin

# Si SOLO VOS tocaste esta rama:
git rebase origin/develop

# Si es COMPARTIDA o no sabés:
git merge origin/develop

# 2. Verificar tests
cd api && npm test && cd ..
cd web && npm test && cd ..

# 3. Push a origin
git push origin feature/{descripcion}
```

### Crear Pull Request

```bash
# Usando GitHub CLI (gh)
gh pr create \
  --base develop \
  --head feature/{descripcion} \
  --title "feat(module): description" \
  --body "## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing done

## Related Issues
Closes #123"
```

### Checklist de PR

- [ ] Rama tiene nombre correcto (feature/, fix/, etc.)
- [ ] Commits son descriptivos y pequeños
- [ ] No hay conflictos con develop
- [ ] CI pasa (lint, typecheck, test, build)
- [ ] Descripción clara del cambio
- [ ] Tests incluidos si aplica
- [ ] Screenshots si hay cambios UI

---

## Recordatorio: Commits WIP

Si necesitás guardar progreso pero no está listo para PR:

```bash
# Commits locales (no se pushean)
git add .
git commit -m "WIP: progress on feature X"

# Cuando esté listo, hacer squash de commits WIP
git rebase -i origin/develop
# Cambiar "pick" por "squash" para commits WIP
```

---

## Comandos de Emergencia

### Si accidentalmente commiteaste en develop

```bash
# Mover último commit a rama nueva
git checkout -b feature/{descripcion}
git checkout develop
git reset --hard HEAD~1
```

### Si necesitás deshacer el último commit (sin perder cambios)

```bash
git reset --soft HEAD~1
# Los cambios quedan staged, podés recommittear
```

### Si necesitás deshacer el último commit (perdiendo cambios)

```bash
git reset --hard HEAD~1
# CUIDADO: esto borra los cambios del último commit
```
