---
name: git-conflict-resolution
description: >
  Resolución de conflictos de Git con reglas específicas para Flutter (archivos
  generados) y API compartida entre múltiples consumidores. Ejecuta al invocar
  /git-conflict-resolution.
---

# Git Conflict Resolution — BoliviaExperience

## Propósito

Resolver conflictos de merge/rebase de forma segura, evitando pérdida de código
y respetando las particularidades del proyecto (Flutter con archivos generados,
API compartida entre Flutter y Web).

---

## Protocolo General

1. Detectar archivos con conflicto
2. Clasificar el tipo de conflicto
3. Aplicar la estrategia correcta según tipo
4. Verificar que el código compila y tests pasan

---

## REGLA CRÍTICA — Archivos Generados de Flutter

**Si el conflicto es en alguno de estos archivos:**

| Archivo | Generador |
|---------|-----------|
| `*.g.dart` | build_runner (json_serializable, etc.) |
| `*.freezed.dart` | freezed |
| `*.g.json` | json_serializable |
| `l10n/*.dart` | gen-l10n / intl_utils |
| `pubspec.lock` | flutter pub get |
| `*.mocks.dart` | mockito |
| `*.mocks.dart` | mocktail |

**NO EDITAR MANUALMENTE. En su lugar:**

### Paso 1: Resolver el archivo FUENTE

- `pubspec.yaml` → resolver dependencias manualmente
- `*.dart` fuente → resolver lógica manualmente

### Paso 2: Regenerar archivos

```bash
cd app
flutter pub get
dart run build_runner build --delete-conflicting-outputs
```

### Paso 3: Verificar

```bash
flutter analyze
flutter test
```

---

## REGLA CRÍTICA — API Compartida entre Flutter y Web

**Si el conflicto es en archivos de `api/`:**

### Paso 1: Identificar qué cambió

| Tipo de cambio | Impacto |
|----------------|---------|
| Nuevo endpoint | Puede afectar a ambos consumidores |
| Cambio de response shape | ROMPE ambos consumidores |
| Cambio de DTO | Verificar si ambos lo usan |
| Cambio de auth/guard | Afecta a ambos |
| Cambio de Prisma schema | Afecta a ambos |

### Paso 2: Preguntar al usuario

- "¿Este cambio de API afecta a Flutter, Web, o ambos?"
- "¿Ya actualizaste el hook en `web/src/services/api.ts`?"
- "¿Ya actualizaste el service en `app/lib/services/`?"

### Paso 3: Después de resolver

1. Actualizar `web/src/services/api.ts` si cambió endpoints
2. Actualizar `app/lib/services/` si cambió endpoints
3. Verificar que AMBOS compilan:

```bash
# Verificar API
cd api && npx tsc --noEmit

# Verificar Web
cd ../web && npx tsc --noEmit

# Verificar Flutter
cd ../app && flutter analyze
```

---

## Estrategias por Tipo de Archivo

### Prisma Schema

| Conflicto | Estrategia |
|-----------|-----------|
| `schema.prisma` vs `schema.sqlite.prisma` | Mantener ambos en sync. El conflicto suele ser porque alguien agregó un modelo sin actualizar ambos. |
| Nuevo modelo | Agregar a ambos schemas con las diferencias de proveedor (cuid vs uuid, Float vs Decimal, etc.) |
| Campo nuevo | Agregar a ambos schemas |

**Después de resolver:**
```bash
cd api
npx prisma generate
node setup-db.js sqlite --seed
```

### package.json

| Conflicto | Estrategia |
|-----------|-----------|
| Dependencia nueva en HEAD | Mergear manualmente, verificar que no hay duplicados |
| Dependencia nueva en incoming | Mergear, ejecutar npm install |
| Versión diferente | Elegir la más reciente compatible, verificar changelog |

**Después de resolver:**
```bash
npm install
npm test
```

### Docker

| Conflicto | Estrategia |
|-----------|-----------|
| Dockerfile stages | Mergear stages cuidadosamente, mantener orden lógico |
| docker-compose services | Mergear servicios, verificar que no hay puertos duplicados |
| Environment variables | Unificar, verificar que no hay secrets hardcodeados |

**Después de resolver:**
```bash
docker-compose config  # Verificar syntax
docker-compose build   # Verificar que build funciona
```

### GitHub Actions

| Conflicto | Estrategia |
|-----------|-----------|
| Steps diferentes en mismo job | Mergear steps, mantener orden lógico |
| Jobs nuevos | Agregar al final |
| Triggers diferentes | Unificar, verificar syntax YAML |

**Después de resolver:**
```bash
# Verificar syntax YAML
cat .github/workflows/ci.yml | python -c "import sys, yaml; yaml.safe_load(sys.stdin)"
```

### TypeScript/JavaScript

| Conflicto | Estrategia |
|-----------|-----------|
| Función modificada en ambas versiones | Analizar lógica de ambas, mergerar cuidadosamente |
| Import nuevo | Agregar, verificar que el módulo existe |
| Tipo/interface modificado | Mantener ambos cambios si son compatibles |

**Después de resolver:**
```bash
npx tsc --noEmit  # Verificar tipos
npm test          # Verificar tests
```

### Flutter/Dart

| Conflicto | Estrategia |
|-----------|-----------|
| Widget modificado | Mergear lógica, verificar que compila |
| Provider/Riverpod | Mergear state, verificar que no hay duplicados |
| Ruta nueva | Agregar a router.dart |
| Archivo generado (ver regla arriba) | NO EDITAR, regenerar |

**Después de resolver:**
```bash
flutter analyze
flutter test
```

---

## Formato de Salida

Cuando el agente analiza un conflicto, debe reportar:

```
## Conflicto Detectado

- **Archivo**: `api/src/modules/auth/auth.service.ts`
- **Líneas afectadas**: 45-62
- **Tipo**: TypeScript/JavaScript

### Versión A (HEAD)
Breve descripción de qué hace el código en HEAD

### Versión B (Incoming)
Breve descripción de qué hace el código incoming

### Análisis
- **Impacto**: API (afecta a Flutter y Web)
- **Riesgo**: Medio (cambio en response shape)

### Resolución Recomendada
<comandos exactos para resolver>

### Verificación Post-Resolución
<comandos para verificar que funciona>
```

---

## Comandos Útiles para Investigar Conflictos

```bash
# Ver archivos con conflicto
git diff --name-only --diff-filter=U

# Ver conflicto en un archivo específico
git diff api/src/modules/auth/auth.service.ts

# Ver versión de HEAD
git show HEAD:api/src/modules/auth/auth.service.ts

# Ver versión de incoming
git show MERGE_HEAD:api/src/modules/auth/auth.service.ts

# Abortar merge si es demasiado complejo
git merge --abort

# Abortar rebase
git rebase --abort
```

---

## Emergencias

### Si accidentalmente guardaste un archivo generado editado

```bash
# Restaurar archivo generado desde develop
git checkout develop -- app/lib/**/*.g.dart
git checkout develop -- app/lib/**/*.freezed.dart

# Regenerar
cd app
dart run build_runner build --delete-conflicting-outputs
```

### Si no sabés qué versión es correcta

```bash
# Ver historial del archivo
git log --oneline -5 api/src/modules/auth/auth.service.ts

# Ver quién modificó por última vez
git blame api/src/modules/auth/auth.service.ts
```
