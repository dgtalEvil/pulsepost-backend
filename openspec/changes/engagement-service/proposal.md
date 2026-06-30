## Why

With content-service running and producing posts, we need a service that handles user interactions on those posts — comments and likes. engagement-service owns all engagement data, drives the trending algorithm, and enforces rate limiting on comments to prevent spam. Its events (`comment.created`, `like.added`) are what notification-service reacts to, so it must exist before notification-service can be built.

## What Changes

- Add `apps/engagement-service/` as a self-contained NestJS app with its own `package.json` and `Dockerfile`
- Add a `comments` table in `engagement_db`: id, postId, authorId, body, createdAt
- Add a `likes` table in `engagement_db`: id, postId, authorId, createdAt — with unique constraint on (postId, authorId)
- Expose three internal HTTP endpoints: `POST /comments`, `POST /likes`, `GET /trending`
- Publish `comment.created` and `like.added` events to RabbitMQ exchange `pulsepost_events`
- Maintain a Redis sorted set `trending:posts` — updated on every like and comment with a weighted score
- Rate-limit comment creation: max 1 comment per (postId, authorId) per 5 seconds via Redis TTL key
- Guard against duplicate likes via DB unique constraint (return 409 on duplicate)

## Capabilities

### New Capabilities

- `comment-creation`: Accept comment from Gateway, persist to DB, enforce rate limit via Redis, publish `comment.created`
- `like-creation`: Accept like from Gateway, persist to DB with duplicate guard, publish `like.added`
- `trending-scores`: Maintain Redis sorted set `trending:posts` updated on every like/comment; expose `GET /trending` returning top N postIds with scores
- `engagement-service-scaffold`: Self-contained NestJS app with own package.json, Dockerfile, TypeORM + Postgres, Redis (ioredis), RabbitMQ (amqplib)

### Modified Capabilities

## Impact

- New directory: `apps/engagement-service/`
- New files: `package.json`, `Dockerfile`, `tsconfig.json`, entity files, service, controller, DTOs, RabbitMQ publisher, Redis service
- Connects to `engagement_db` (already created by infra init.sql)
- Connects to RabbitMQ exchange `pulsepost_events` and publishes to it (no consuming in this service)
- Connects to Redis for rate limiting and trending sorted set
- Service will run on `PORT=3002`
- No changes to existing files
