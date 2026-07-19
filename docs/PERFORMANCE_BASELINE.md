# Performance Baseline — BoliviaExperience API

**Date**: 2026-07-18
**Environment**: Local development (SQLite, single instance)

## Response Time Benchmarks

Target: < 500ms for all endpoints (P95)

| Endpoint | Method | Target | Notes |
|----------|--------|--------|-------|
| `GET /api/v1/places` | GET | < 200ms | Paginated, 20 items |
| `GET /api/v1/places/:id` | GET | < 100ms | Single item |
| `GET /api/v1/places/featured` | GET | < 150ms | Cached subset |
| `GET /api/v1/categories` | GET | < 50ms | Small dataset (10 items) |
| `GET /api/v1/events` | GET | < 150ms | Paginated |
| `GET /api/v1/promotions` | GET | < 150ms | Paginated |
| `GET /api/v1/search?q=...` | GET | < 300ms | Full-text search |
| `GET /api/v1/map/nearby` | GET | < 500ms | Geospatial query |
| `POST /api/v1/auth/login` | POST | < 300ms | Password hash + JWT |
| `POST /api/v1/auth/register` | POST | < 500ms | User creation |
| `POST /api/v1/places/:id/reviews` | POST | < 200ms | Review creation |
| `GET /api/v1/notifications` | GET | < 100ms | User-scoped list |

## Load Test Recommendations

- **Concurrent users**: 50 (MVP target: 350 MAU)
- **Requests per second**: 10 (Nginx rate limit: 10r/s general, 2r/s auth)
- **Database connections**: SQLite (single writer) / PostgreSQL pool (10-20 connections)

## Monitoring Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API response time (P95) | < 500ms | > 1000ms |
| Error rate (5xx) | < 0.1% | > 1% |
| CPU usage | < 70% | > 85% |
| Memory usage | < 512MB | > 768MB |
| Database query time (P95) | < 100ms | > 500ms |

## Known Performance Considerations

1. **SQLite single-writer**: Under load, write contention may increase. Migrate to PostgreSQL for production.
2. **Geospatial queries**: PostGIS `ST_DWithin` is indexed; Haversine JS fallback for SQLite is slower.
3. **No caching layer**: Redis/Memcached recommended for production (see ADR-223).
4. **Firebase lazy init**: First Firebase call may have cold start latency.

## How to Measure

```bash
# Simple timing with curl
time curl -s http://localhost:3000/api/v1/places > /dev/null

# With Apache Bench (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:3000/api/v1/places

# With wrk (more accurate)
wrk -t4 -c10 -d30s http://localhost:3000/api/v1/places
```
