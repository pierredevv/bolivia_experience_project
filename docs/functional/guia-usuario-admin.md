# Guía de Usuario — Panel Administrativo

**BoliviaExperience** — Panel de administración para gestionar la plataforma.

---

## Acceso

1. Navegar a `/admin-panel/login`
2. Ingresar email y contraseña de administrador
3. Click en "Iniciar Sesión"

**Credenciales de prueba:**
- Email: `admin@boliviaexperience.com`
- Contraseña: `password123`

---

## Dashboard

Página principal con estadísticas generales:

- **Total de usuarios** — Usuarios registrados en la plataforma
- **Total de lugares** — Lugares turísticos activos
- **Total de reseñas** — Reseñas escritas por usuarios
- **Eventos activos** — Eventos publicados
- **Reseñas pendientes** — Reseñas esperando aprobación

También muestra las reseñas y usuarios recientes.

---

## Gestión de Empresas

**URL:** `/admin-panel/businesses`

### Ver empresas
- Lista todas las empresas registradas
- Filtrar por estado: Todas, Pendientes, Aprobadas, Rechazadas

### Aprobar empresa
1. Encontrar la empresa con estado "Pendiente"
2. Click en "Aprobar"
3. La empresa y su lugar se activan automáticamente
4. La empresa puede iniciar sesión en `/business/login`

### Suspender empresa
1. Encontrar la empresa a suspender
2. Click en "Suspender"
3. La empresa y su lugar se desactivan
4. La empresa no puede iniciar sesión

---

## Gestión de Lugares

**URL:** `/admin-panel/places`

### Ver lugares
- Vista de cuadrícula con fotos
- Filtrar por estado: Todos, Activos, Ocultos
- Buscar por nombre o dirección

### Crear lugar
1. Click en "Nuevo Lugar"
2. Completar formulario:
   - Nombre (requerido)
   - Descripción
   - Dirección (requerido)
   - Teléfono
   - Categoría (requerido)
   - Coordenadas (latitud, longitud)
   - Redes sociales (Instagram, Facebook, TikTok)
   - Destacado (checkbox)
3. Click en "Guardar"

### Editar lugar
1. Click en el lugar a editar
2. Modificar campos necesarios
3. Click en "Guardar"

### Cambiar estado
- Click en el ícono de ojo para activar/desactivar
- Lugares ocultos no aparecen en la app móvil

### Eliminar lugar
1. Click en "Eliminar"
2. Confirmar en el diálogo de confirmación

---

## Gestión de Usuarios

**URL:** `/admin-panel/users`

### Ver usuarios
- Lista paginada de todos los usuarios
- Buscar por nombre o email
- Filtrar por rol: Todos, Admin, Empresa, Usuario

### Cambiar rol
1. Click en "Editar" del usuario
2. Seleccionar nuevo rol
3. Click en "Guardar"

---

## Gestión de Reseñas

**URL:** `/admin-panel/reviews`

### Ver reseñas
- Lista paginada de todas las reseñas
- Filtrar por estado: Todas, Pendientes, Aprobadas

### Aprobar reseña
1. Encontrar reseña pendiente
2. Click en "Aprobar"
3. La reseña aparece públicamente

### Responder reseña
1. Click en "Responder"
2. Escribir respuesta
3. Click en "Enviar"

---

## Gestión de Eventos

**URL:** `/admin-panel/events`

### Crear evento
1. Click en "Nuevo Evento"
2. Completar formulario:
   - Nombre (requerido)
   - Descripción
   - Fecha inicio y fin
   - Ubicación
   - Categoría
   - Foto
3. Click en "Guardar"

### Editar/Eliminar
- Click en el evento para editar
- Click en "Eliminar" para borrar

---

## Gestión de Promociones

**URL:** `/admin-panel/promotions`

### Crear promoción
1. Click en "Nueva Promoción"
2. Seleccionar lugar
3. Completar formulario:
   - Título (requerido)
   - Descripción
   - Descuento (%)
   - Fecha inicio y fin
   - Foto
4. Click en "Guardar"

---

## Gestión de Categorías

**URL:** `/admin-panel/categories`

### Crear categoría
1. Click en "Nueva Categoría"
2. Completar formulario:
   - Nombre (requerido)
   - Nombre en inglés
   - Icono (emoji)
   - Slug (requerido)
   - Descripción
   - Orden de visualización
3. Click en "Guardar"

---

## Configuración

**URL:** `/admin-panel/settings`

- **Nombre del sitio** — Nombre que aparece en la plataforma
- **Email de contacto** — Email para soporte
- **Modo mantenimiento** — Activar/desactivar modo mantenimiento
- **Idioma predeterminado** — Idioma por defecto de la plataforma

Click en "Guardar" para aplicar cambios.

---

## Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `Esc` | Cerrar modales |
| `Tab` | Navegar entre campos |

---

## Cerrar Sesión

1. Click en el avatar del usuario (esquina superior derecha)
2. Click en "Cerrar Sesión"
3. Redirige a `/admin-panel/login`
