## 1. RabbitMQ Definitions

- [x] 1.1 Create `rabbitmq/` directory at repo root
- [x] 1.2 Write `rabbitmq/definitions.json` declaring topic exchange `pulsepost_events`, queues `content-service-queue` and `notification-service-queue`, and all bindings for routing keys `post.created`, `comment.created`, `like.added`, `media.processed`

## 2. Postgres Init Script

- [x] 2.1 Create `postgres/` directory at repo root
- [x] 2.2 Write `postgres/init.sql` that creates databases `content_db`, `engagement_db`, and `media_db`

## 3. Docker Compose

- [x] 3.1 Write `docker-compose.yml` at repo root with `rabbitmq` service (rabbitmq:3-management-alpine), ports 5672 and 15672, definitions.json mounted, named volume, healthcheck
- [x] 3.2 Add `redis` service (redis:7-alpine), port 6379, named volume, healthcheck
- [x] 3.3 Add `postgres` service (postgres:16-alpine), port 5432, init.sql mounted, named volume, healthcheck, env vars for POSTGRES_USER and POSTGRES_PASSWORD
- [x] 3.4 Declare named volumes (`rabbitmq_data`, `redis_data`, `postgres_data`) at the bottom of docker-compose.yml

## 4. Verification

- [x] 4.1 Run `docker-compose up -d` and confirm all three containers reach healthy state
- [x] 4.2 Open RabbitMQ management UI at `http://localhost:15672` (guest/guest) and confirm exchange `pulsepost_events` and both queues exist
- [x] 4.3 Run `redis-cli ping` and confirm response is `PONG`
- [x] 4.4 Run `psql -h localhost -U postgres -c "\l"` and confirm `content_db`, `engagement_db`, and `media_db` are listed
