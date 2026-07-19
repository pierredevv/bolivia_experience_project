---
name: "flutter_mobile_dev"
description: "Configuraciones de red, manejo de Riverpod, y degradación elegante offline para Flutter."
---

# Estandarización de Desarrollo Móvil (Flutter)

## 1. Pruebas Físicas y Red Local
- Cuando pruebes la app en un dispositivo Android o iOS físico, NO utilices `http://localhost:3000`. 
- Crea un archivo `.env` o una clase de configuración `AppConfig` que lea la IP de la máquina host en la misma red Wi-Fi (ej. `192.168.1.52`).
- Las conexiones de red deben utilizar un `Dio` client configurado con un timeout razonable (ej. 10 segundos) para manejar redes inestables en el país.

## 2. Gestión de Estado con Riverpod
- Se prohíbe el uso intensivo de `StatefulWidget` para la lógica de negocio.
- Usa `NotifierProvider` o `AsyncNotifierProvider` para manejar las peticiones a la API. Las interfaces deben reaccionar utilizando el método `.when(data: ..., loading: ..., error: ...)` de los objetos `AsyncValue`.

## 3. Degradación Elegante (Offline-first)
- Al recuperar el catálogo de "Locaciones Principales", guárdalos en cache local (SQLite o Hive).
- Si el usuario pierde conexión (ej. en carreteras o zonas remotas), la app debe seguir funcionando en "Modo Lectura" mostrando los datos cacheados y un banner sutil que indique: "Sin conexión a internet. Mostrando versión guardada".
