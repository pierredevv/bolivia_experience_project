---
name: git-environment-guard
description: >
  Auditoría de entornos: detectar secretos en código, validar .gitignore,
  y generar templates de variables de entorno. Ejecuta al invocar
  /git-environment-guard.
---

# Git Environment Guard — BoliviaExperience

## Propósito

Proteger el repositorio de:
1. Secretos filtrados accidentalmente (API keys, passwords, tokens)
2. Archivos .env commiteados
3. .gitignore incompleto
4. Variables de entorno mal configuradas

---

## Auditoría de Secretos

### Patrones de detección

| Tipo | Patrón_regex | Ejemplo |
|------|-------------|---------|
| API Key | `api[_-]?key['":\s]*[=:]\s*['"][^'"]+` | `API_KEY="abc123"` |
| JWT Secret | `jwt[_-]?secret['":\s]*[=:]\s*['"][^'"]+` | `JWT_SECRET=mysecret` |
| Database URL | `database[_-]?url['":\s]*[=:]\s*['"]*postgres` | `DATABASE_URL="postgres://..."` |
| Firebase Private Key | `firebase[_-]?(private[_-]?key\|service[_-]?account)` | `FIREBASE_PRIVATE_KEY="-----BEGIN..."` |
| GCP Credentials | `GOOGLE_APPLICATION_CREDENTIALS` | `GOOGLE_APPLICATION_CREDENTIALS="./key.json"` |
| AWS Key | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| Generic Secret | `(secret\|password\|token\|credential)['":\s]*[=:]\s*['"][^'"]+` | `secret="abc123"` |

### Comando de escaneo

```bash
# Escanear archivos staged para secretos
git diff --cached --name-only | xargs grep -l -E '(api[_-]?key|jwt[_-]?secret|database[_-]?url|password|secret|token)\s*[:=]\s*["'"'"'][^"'"'"']+' 2>/dev/null

# Escanear todo el repo (excepto node_modules)
grep -r -l -E '(api[_-]?key|jwt[_-]?secret|database[_-]?url|password|secret|token)\s*[:=]\s*["'"'"'][^"'"'"']+' --include="*.ts" --include="*.js" --include="*.dart" --include="*.yml" --include="*.yaml" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build .
```

### Archivos que NUNCA deben commitearse

| Archivo | Razón |
|---------|-------|
| `.env` | Variables de entorno local |
| `.env.local` | Variables de entorno local |
| `.env.production` | Variables de producción |
| `*.pem` | Certificados SSL |
| `*.key` | Llaves privadas |
| `*-service-account.json` | Credenciales GCP |
| `google-services.json` | Config Firebase Android |
| `GoogleService-Info.plist` | Config Firebase iOS |
| `*.jks` | Java KeyStore |

---

## Auditoría de .gitignore

### Patrones que DEBEN estar presentes

```gitignore
# Environment & secrets
.env
.env.*
!.env.example

# Node / NestJS
node_modules/
dist/
coverage/

# SQLite dev databases
api/prisma/*.db
api/prisma/*.db-journal

# Uploads (user-generated content)
api/uploads/*
!api/uploads/.gitkeep

# MiMoCode internal
.mimocode/

# Windows artifacts
nul

# Flutter / Dart
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
pubspec.lock
build/
*.iml
*.ipr
*.iws
.idea/
.metadata

# Android build
app/android/.gradle/
app/android/app/debug/
app/android/app/profile/
app/android/app/release/

# iOS
app/ios/Pods/
app/ios/.symlinks/
app/ios/Flutter/Flutter.framework
app/ios/Flutter/Flutter.podspec
app/ios/Runner.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist
app/ios/Flutter/App.framework
app/ios/Flutter/Generated.xcconfig

# Web
web/node_modules/
web/dist/

# OS files
.DS_Store
Thumbs.db
Desktop.ini

# IDE
.vscode/
*.swp
*.swo
*~

# SSL certificates (never commit)
nginx/ssl/*.pem
nginx/ssl/*.key

# Logs
*.log
npm-debug.log*
```

### Comando de verificación

```bash
# Verificar que .gitignore existe y tiene contenido
cat .gitignore | wc -l

# Verificar que .env no está tracked
git ls-files .env .env.* | grep -v .env.example

# Verificar que node_modules no está tracked
git ls-files node_modules/

# Verificar que archivos sensibles no están tracked
git ls-files "*.pem" "*.key" "*service-account.json" "*.jks"
```

---

## Variables de Entorno por Servicio

### API (NestJS)

```bash
# .env.example para API
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"

# Modo PostgreSQL (producción)
# DB_PROVIDER=postgresql
# DATABASE_URL="postgresql://postgres:postgres@localhost:5433/bolivia_experience"

JWT_SECRET=your-jwt-secret-here
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Firebase (opcional - lazy init)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email

# APIs (opcional)
GOOGLE_MAPS_API_KEY=your-google-maps-key
OPENWEATHER_API_KEY=your-openweather-key
GCS_BUCKET=your-gcs-bucket
```

### Web (React)

```bash
# .env.example para Web
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Flutter (App)

```bash
# .env.example para Flutter
# Las variables de Flutter se manejan en:
# - android/app/src/main/AndroidManifest.xml (Android)
# - ios/Runner/Info.plist (iOS)
# - lib/config/constants.dart (valores por defecto)

API_BASE_URL=http://10.0.2.2:3000  # Android emulator
# API_BASE_URL=http://localhost:3000  # iOS simulator
```

### Docker

```bash
# docker-compose.yml variables
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=bolivia_experience
POSTGRES_PORT=5433
```

---

## Separación de Entornos

### Desarrollo Local (SQLite)

```bash
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

### Desarrollo con Docker (PostgreSQL)

```bash
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/bolivia_experience"
NODE_ENV=development
```

### Producción (GCP Cloud SQL)

```bash
DB_PROVIDER=postgresql
DATABASE_URL="${DATABASE_URL}"  # From GCP Secret Manager
NODE_ENV=production
JWT_SECRET="${JWT_SECRET}"  # From GCP Secret Manager
```

---

## Formato de Salida

Cuando el agente audita entornos:

```
## Auditoría de Entornos

### Secretos detectados en código
| Archivo:Línea | Tipo | Riesgo |
|---------------|------|--------|
| api/.env:5 | JWT_SECRET | ALTO - Archivo .env commiteado |
| web/src/config.ts:12 | API_KEY | MEDIO - Key hardcodeada |

### .gitignore completeness
| Patrón | ¿Presente? | Estado |
|--------|------------|--------|
| .env | ✅ | OK |
| node_modules/ | ✅ | OK |
| *.pem | ✅ | OK |
| .mimocode/ | ⚠️ | FALTA - Agregar |

### Variables de entorno
| Variable | Servicio | ¿Está en .env.example? |
|----------|----------|------------------------|
| JWT_SECRET | API | ✅ |
| DATABASE_URL | API | ✅ |
| GOOGLE_MAPS_API_KEY | API | ⚠️ FALTA |
```

---

## Acciones Correctivas

### Si se encontró un secreto commiteado

```bash
# 1. Agregar a .gitignore
echo ".env" >> .gitignore

# 2. Remover del tracking (sin borrar localmente)
git rm --cached .env

# 3. Hacer commit
git commit -m "chore(security): remove .env from tracking"

# 4. SI EL SECRETO ES SENSIBLE, rotarlo inmediatamente
#    (generar nuevo secret en el servicio correspondiente)
```

### Si .gitignore está incompleto

```bash
# 1. Agregar patrones faltantes
echo -e "\n# Secrets\n.env\n.env.*\n!.env.example" >> .gitignore

# 2. Verificar que funciona
git status
```
