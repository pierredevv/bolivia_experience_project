---
name: git-conflict-resolution
description: >
  Resolución de conflictos de Git. Ejecuta al invocar /git-conflict-resolution.
---

# Git Conflict Resolution

## REGLA FLUTTER — Archivos Generados

Si el conflicto es en: *.g.dart, *.freezed.dart, pubspec.lock

NO EDITAR MANUALMENTE. En su lugar:
1. Resolver el archivo FUENTE
2. Regenerar: `dart run build_runner build --delete-conflicting-outputs`

## REGLA API COMPARTIDA

Si el conflicto es en api/:
1. Identificar qué cambió
2. Preguntar: "¿Afecta a Flutter, Web, o ambos?"
3. Verificar que ambos compilan después

## Estrategias por tipo

| Tipo | Estrategia |
|------|-----------|
| Prisma schema | Mantener sync entre schemas |
| package.json | Mergear dependencias |
| Docker | Mergear stages |
| TypeScript | Mergear lógica, verificar types |
