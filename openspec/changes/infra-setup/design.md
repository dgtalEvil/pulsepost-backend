## Context

PulsePost backend has 5 NestJS services that need three shared infrastructure components before any service code can run:
- **RabbitMQ**: async message broker for inter-service events
- **Redis**: pub/sub channel for SSE fan-out, sorted-set for trending, rate-limit counters
- **PostgreSQL**: relational store; each service owns its own database to enforce isolation

All three run as Docker containers managed by a single `docker-compose.yml`. This step provisions only the infrastructure — no NestJS app containers yet.

## Goals / Non-Goals

**Goals:**
- Single `docker-compose up` brings up all three infrastructure services
- RabbitMQ starts with exchange, queues, and bindings pre-declared (no manual setup after boot)
- Postgres starts with per-service databases already created
- All ports exposed locally for direct verification via CLI tools and management UI
- Persistent volumes so data survives container restarts during development

**Non-Goals:**
- NestJS app containers (added per service in later steps)
- Production-grade TLS, secrets management, or HA configuration
- Schema migrations (each service runs its own migrations on startup)

## Decisions

**RabbitMQ definitions.json over management API scripting**
Pre-loading `definitions.json` via the `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` or the management plugin's load path means the exchange and queues exist the moment the container is healthy — no timing issues, no manual curl calls after boot. Alternative (scripting via management API on first boot) adds fragile ordering logic. Definitions file wins.

**Single Postgres container, multiple databases**
Each service gets its own database (`content_db`, `engagement_db`, `media_db`) on the same Postgres instance. True isolation would be separate Postgres containers per service, but that's unnecessary overhead for local dev. The important boundary is at the schema/database level, not the container level. A single init SQL script creates all databases on first boot.

**Redis single node, no persistence config**
Redis is used for ephemeral state (rate-limit TTLs, pub/sub, trending scores). No AOF/RDB persistence needed for local dev — if Redis restarts, trending resets and active SSE connections drop, both acceptable in development.

**Named Docker volumes for Postgres and RabbitMQ**
Ensures data survives `docker-compose restart` without surviving `docker-compose down -v` (which is the desired reset behavior in dev).

## Risks / Trade-offs

[RabbitMQ not yet healthy when services start] → Mitigated by `depends_on` with `condition: service_healthy` in each app's compose block (added in later steps). For this step, only infra containers exist so ordering is not yet critical.

[Postgres init script runs only on first volume creation] → If schema changes are needed, developer must `docker-compose down -v` and re-up. Acceptable for local dev; documented in README.

[Single Redis for all concerns] → Rate-limit keys, pub/sub channels, and sorted sets share one instance. No isolation risk at this scale; all keys are namespaced by service convention.
