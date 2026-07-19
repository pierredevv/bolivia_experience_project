# Heartbeat: Estado de Salud y Configuración de Entorno

## 1. Conectividad Local (Mobile Testing)
Para el correcto funcionamiento del ecosistema durante el desarrollo, la aplicación móvil en Flutter **NO debe apuntar a `localhost` o `127.0.0.1`**, ya que esto resolvería hacia el emulador o dispositivo físico.
- **Host de la API:** `http://192.168.1.X:3000` (Reemplazar la 'X' por la IP estática local del equipo de desarrollo asignada por el router Wi-Fi).
- **Mapeo de Endpoints Mobile:**
  - Auth: `http://192.168.1.X:3000/api/v1/auth`
  - Lugares: `http://192.168.1.X:3000/api/v1/locations`
  - Eventos: `http://192.168.1.X:3000/api/v1/events`

## 2. Variables de Entorno y Secretos (Backend NestJS)
El contenedor de NestJS exige las siguientes validaciones en su `ConfigModule`:
- `DATABASE_URL`: Conexión a PostgreSQL 15 + PostGIS (esquema `prisma`).
- `FIREBASE_PROJECT_ID` y credenciales para verificación de tokens JWT.
- `REDIS_URL`: (Futuro) para caché de resultados de filtros complejos (presupuesto/tiempo).

## 3. Estado de los Contenedores (Docker)
- `db-postgres`: PostgreSQL 15 con extensión PostGIS instalada y corriendo en el puerto 5432.
- Estado de sincronización Prisma: Mantener siempre alineado con `npx prisma db push` en entornos dev antes de levantar el backend.
