# Reglas y Orquestación de Agentes (Project-Scoped Rules)

Estás trabajando en **BoliviaExperience**, un proyecto crítico con arquitectura distribuida en tres frentes: un backend monolítico inyectable (NestJS), un backoffice reactivo (React/Vite) y una aplicación B2C móvil (Flutter).

## Directrices Universales de Actuación
1. **Consulta la Memoria:** Antes de sugerir una nueva dependencia o cambio estructural, revisa `memory/MEMORY.md` y `memory/SOUL.md`. La arquitectura técnica (ADRs) es restrictiva e inamovible (Flutter, React, NestJS, Prisma, PostGIS).
2. **Contexto de Red:** Si estás depurando un error de red entre la app móvil y el backend, DEBES revisar `memory/HEARTBEAT.md` y confirmar que el usuario está apuntando a la IP local del router, no al localhost estéril del dispositivo móvil.
3. **Estética Premium:** La app representa al turismo nacional. Todo diseño (React/Flutter) debe regirse por `skills/frontend-design/SKILL.md`. Usa tipografía moderna, interfaces asimétricas (Bento), y animaciones fluidas. Ningún layout "básico" de HTML puro es aceptable.
4. **Respeto por el Código Existente:** Conserva la estructura de carpetas, mantén los decoradores de NestJS intactos y prioriza la composición de hooks en React y de providers en Riverpod (Flutter).
5. **Auditorías Frecuentes:** Cada cambio masivo en el front o back debe ser registrado actualizando el archivo `memory/AUDIT_[FECHA].md` correspondiente.
