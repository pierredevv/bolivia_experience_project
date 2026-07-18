# Deployment Checklist — BoliviaExperience

Checklist completo para desplegar la plataforma en producción.

---

## Pre-Deploy

### Código
- [ ] Todos los tests pasan (195/195)
- [ ] TypeScript build sin errores
- [ ] No hay console.logs de debug
- [ ] No hay credenciales hardcodeadas
- [ ] .gitignore actualizado

### Seguridad
- [ ] JWT_SECRET configurado (no es el default)
- [ ] CORS_ORIGIN restringido al dominio real
- [ ] Rate limiting habilitado
- [ ] HTTPS habilitado
- [ ] Security headers configurados en Nginx

### Base de Datos
- [ ] PostgreSQL configurado (no SQLite)
- [ ] Migraciones ejecutadas
- [ ] Seed datos iniciales cargados
- [ ] Backup automático configurado

### Infraestructura
- [ ] Docker images construidos
- [ ] docker-compose.yml configurado para producción
- [ ] Nginx configurado con SSL
- [ ] Health checks funcionando
- [ ] Logs configurados

---

## Deploy

### 1. Configurar Variables de Entorno

```bash
# Production .env
DB_PROVIDER=postgresql
DATABASE_URL=postgresql://user:password@host:5432/bolivia_experience
JWT_SECRET=<generar-con-openssl-rand-base64-64>
NODE_ENV=production
CORS_ORIGIN=https://boliviaexperience.com
GCS_BUCKET=bolivia-experience-uploads
```

### 2. Construir y Desplegar

#### Opción A: Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Opción B: GCP Cloud Run
```bash
# Push images a GCR
docker push us-central1-docker.pkg.dev/PROJECT_ID/bolivia-experience/api:latest
docker push us-central1-docker.pkg.dev/PROJECT_ID/bolivia-experience/web:latest

# Deploy a Cloud Run
gcloud run deploy bolivia-experience-api --image ... --region us-central1
gcloud run deploy bolivia-experience-web --image ... --region us-central1
```

### 3. Verificar

- [ ] API responde en `/health`
- [ ] Swagger docs accesibles en `/docs`
- [ ] Landing page carga correctamente
- [ ] Login admin funciona
- [ ] Login business funciona
- [ ] CRUD de lugares funciona
- [ ] Upload de fotos funciona

---

## Post-Deploy

### Monitoreo
- [ ] Cloud Logging configurado
- [ ] Alertas de error rate > 5%
- [ ] Alertas de latency > 2s
- [ ] Alertas de memory usage > 80%

### Backup
- [ ] Backup automático de PostgreSQL (diario)
- [ ] Backup de Cloud Storage
- [ ] Procedure de restore documentado

### Dominio
- [ ] DNS configurado
- [ ] SSL certificate activo
- [ ] Redirect HTTP → HTTPS

### Analytics
- [ ] Google Analytics 4 instalado
- [ ] Google Tag Manager configurado
- [ ] Eventos de conversión definidos

---

## Rollback

### Si hay problemas después del deploy:

1. **Rollback inmediato:**
   ```bash
   # Docker Compose
   docker-compose down
   git checkout <previous-tag>
   docker-compose up -d

   # Cloud Run
   gcloud run services update-traffic bolivia-experience-api --to-revisions=PREVIOUS_REVISION=100
   ```

2. **Verificar:**
   - [ ] API responde correctamente
   - [ ] Web carga correctamente
   - [ ] No hay errores en logs

3. **Investigar:**
   - Revisar logs de error
   - Identificar causa raíz
   - Fix y redeploy

---

## Cronograma de Lanzamiento

### Semana 1: Soft Launch
- [ ] Deploy a producción
- [ ] Invitar 10 beta testers
- [ ] Recoger feedback
- [ ] Fix bugs críticos

### Semana 2: Limited Launch
- [ ] Deploy fixes
- [ ] Invitar 50 usuarios
- [ ] Publicar en redes sociales locales
- [ ] Recoger métricas

### Semana 3: Full Launch
- [ ] Deploy final
- [ ] Publicar app en Google Play y App Store
- [ ] Campaña de marketing
- [ ] Monitorear métricas

---

## Contactos

| Rol | Nombre | Email |
|-----|--------|-------|
| Tech Lead | — | — |
| DevOps | — | — |
| PM | — | — |
