# Contexto Histórico y Decisiones de Arquitectura (ADRs)

Este archivo actúa como la memoria a largo plazo del proyecto `BoliviaExperience`, registrando por qué se tomaron las decisiones tecnológicas y cómo evolucionó el sistema.

## Decisiones Fundamentales (Resumen de Docs)
- **ADR-201 (Mobile - Flutter 3.x):** Se eligió Flutter con Dart 3 por su rendimiento nativo, su motor gráfico impulsado por Impeller, y la capacidad de compilar para Android/iOS desde un solo codebase, optimizando recursos para el MVP. Estado manejado con Riverpod.
- **ADR-202 (Web - React 18 + Vite):** Seleccionado para el panel de administración B2B/B2C por su robustez, madurez del ecosistema TypeScript, y tiempos de build ultrarrápidos con Vite comparados con Webpack.
- **ADR-203 (Backend - NestJS 10):** Arquitectura modular inyectable. Ideal para manejar lógica pesada, interceptores de autenticación y validación estricta (Class Validator/Transformer).
- **ADR-204 y ADR-205 (PostgreSQL + PostGIS & Prisma 5):** Requerimos cálculos geoespaciales nativos para recomendar lugares cercanos y filtrar eficientemente. Prisma se utiliza como ORM tipado para mayor seguridad transaccional.

## Evolución del Proyecto
- **Fase MVP (Actual):** Enfoque iterativo (Lean Startup). Se prioriza la adquisición masiva de turistas con un catálogo base de 200 locaciones y retención basada en degradación elegante (offline-first).
- **Deuda Técnica Consciente:** Las consultas espaciales complejas actualmente se manejan vía Prisma raw queries (`$queryRaw`) porque Prisma no soporta tipos geométricos de PostGIS de manera nativa en su DSL.
