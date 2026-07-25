---
name: git-workflow
description: >
  Guía completa de flujo de trabajo Git. Ejecuta al invocar /git-workflow.
---

# Git Workflow Automation

## Al INICIAR trabajo

### Pregunta obligatoria
"¿Trabajás solo en esta feature o hay otro dev involucrado?"

### Rama Sugerida
- feature/{descripcion-corta}
- fix/{descripcion-corta}

### Comandos
```bash
git checkout develop
git pull origin develop
git checkout -b feature/{descripcion}
```

## Durante desarrollo

### Commits (Conventional Commits)
```
<type>(<scope>): <description>
```
Tipos: feat, fix, docs, style, refactor, test, chore

## Al COMPLETAR trabajo

### Preparar PR
```bash
git fetch origin
git rebase origin/develop  # o git merge si es compartida
git push origin feature/{descripcion}
```

### Crear PR
```bash
gh pr create --base develop --head feature/{descripcion} \
  --title "feat(module): description" \
  --body "## Changes\n- ..."
```
