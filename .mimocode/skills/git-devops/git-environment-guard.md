---
name: git-environment-guard
description: >
  Detección de secretos y auditoría de .gitignore. Ejecuta al invocar /git-environment-guard.
---

# Git Environment Guard

## Patrones de detección de secretos

- API keys: api[_-]?key['":\s]*[=]['"][^'"]+
- JWT secrets: jwt[_-]?secret['":\s]*[=]['"][^'"]+
- Database URLs: database[_-]?url['":\s]*[=]['"]*postgres
- Firebase keys: firebase[_-]?(private[_-]?key|service[_-]?account)

## .gitignore completeness check

Verificar presencia de:
- .env / .env.* (excepto .env.example)
- node_modules/
- dist/ / build/
- *.db / *.db-journal
- api/uploads/*
- nginx/ssl/*.pem / *.key

## Acciones Correctivas

Si se encontró un secreto:
```bash
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "chore(security): remove .env from tracking"
```
