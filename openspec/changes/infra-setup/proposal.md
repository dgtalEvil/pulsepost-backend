## Why

PulsePost's backend services (content, engagement, media, notification, gateway) all depend on shared infrastructure — a message broker, a cache/pub-sub layer, and a database — before any service can be built or verified. Standing up this infrastructure first means every subsequent service can connect to real dependencies from day one, enabling runtime verification at each build step.

## What Changes

- Add `docker-compose.yml` at the repo root orchestrating all infrastructure containers
- Add RabbitMQ (with management UI) as the async message broker between services
- Add Redis as the cache, pub/sub bus, and sorted-set store
- Add PostgreSQL as the shared database host (each service will own its own schema)
- Add `rabbitmq/definitions.json` to pre-declare the topic exchange, per-service queues, and routing key bindings so services connect to a fully configured broker on startup
- Add a Postgres init script to create per-service databases

## Capabilities

### New Capabilities

- `rabbitmq-exchange`: Topic exchange `pulsepost_events` with queues and bindings for all routing keys (`post.created`, `comment.created`, `like.added`, `media.processed`)
- `redis-instance`: Single Redis node serving as cache, pub/sub channel host, and sorted-set store for trending
- `postgres-instance`: Single Postgres host with isolated databases per service (`content_db`, `engagement_db`, `media_db`)
- `docker-compose-infra`: Compose file wiring all three infrastructure services with correct ports, volumes, and health checks

### Modified Capabilities

## Impact

- New file: `docker-compose.yml` at repo root
- New file: `rabbitmq/definitions.json`
- New file: `postgres/init.sql` (init script mounted into the Postgres container)
- No application code affected — this step contains infrastructure config only
- All 5 NestJS apps will depend on this infra; their service blocks will be added to `docker-compose.yml` in a later step
