# El Alma de BoliviaExperience: Filosofía y Reglas de Negocio

El núcleo de BoliviaExperience no es ser "un mapa más", sino un orquestador de viajes hiper-personalizado. Toda implementación de código debe respetar estos pilares de negocio:

## 1. El Filtro Dinámico de Restricciones (Presupuesto y Tiempo)
- **Filosofía:** El turista boliviano o extranjero siempre tiene restricciones de tiempo (ej. "tengo 3 horas antes de mi bus") o presupuesto (ej. "solo tengo 150 Bs.").
- **Lógica de Back-end:** Al consultar `/locations/recommendations`, el sistema de NestJS debe ejecutar una función que evalúe el costo total estimado de una actividad (transporte local + ticket de ingreso + comida promedio) contra el parámetro `maxBudget`.
- **Lógica Espacial:** Si el parámetro `availableTime` es de 2 horas, la consulta de PostGIS debe descartar lugares donde el radio de distancia y el `average_visit_duration` excedan el tiempo disponible del usuario.

## 2. El Feed de Eventos "En Vivo"
- **Significado:** La app debe sentirse "viva". Las festividades, entradas folklóricas, y mercados locales cambian por minuto.
- **UI/UX:** Los eventos activos deben tener jerarquía visual inmediata. En Flutter y React, todo evento en curso debe poseer un badge rojo parpadeante de "En Vivo" o "Sucediendo Ahora".
- **Degradación Elegante:** Si la red es inestable (común en áreas remotas de Bolivia), la app debe mostrar la última versión cacheada de locaciones en SQLite local y notificar al usuario.
