## Context

content-service is the first NestJS application in the PulsePost backend. It owns the `posts` table in `content_db` and is the only service that reads or writes that table. It communicates outward via RabbitMQ (publishes `post.created`, consumes `media.processed`) and inward via HTTP (Gateway calls it directly). It runs as a standalone Node.js process in its own Docker container.

Tech stack for this service: NestJS, TypeORM, pg driver, amqplib for RabbitMQ.

## Goals / Non-Goals

**Goals:**
- Self-contained NestJS app with zero imports from other apps in this repo
- TypeORM entity with synchronize:true for local dev (no migration tooling needed at this stage)
- Reliable RabbitMQ publish on post creation — if publish fails, the post is still saved (DB write is not rolled back)
- Idempotent `media.processed` consumer — processing the same event twice does not corrupt post status
- Simple, readable code — no over-engineering for a service that has 3 endpoints and 2 event handlers

**Non-Goals:**
- Pagination on GET /posts (not required by the build prompt)
- Auth validation beyond reading `x-user-id` header and storing it as `authorId`
- Database migrations (TypeORM `synchronize: true` is acceptable for local dev)
- Retry logic on RabbitMQ publish failures
- Unit tests (verification is done via curl + RabbitMQ UI per the build order)

## Decisions

**TypeORM with synchronize:true over raw SQL or Prisma**
NestJS has first-class TypeORM support. `synchronize: true` auto-creates the posts table from the entity definition on startup — no migration files needed for local dev. Prisma would add a separate CLI step and schema file; raw SQL would require manual table creation. TypeORM wins for simplicity here.

**amqplib directly over @golevelup/nestjs-rabbitmq or nestjs-amqp**
The NestJS RabbitMQ community libraries add abstractions (decorators, module config) that are helpful at scale but add hidden complexity for a learning project. Using `amqplib` directly keeps the connection, publish, and consume logic explicit and readable — you can see exactly what's happening.

**Post status logic: published vs draft decided at creation time**
If `mediaId` is null in the request → status = `published`. If `mediaId` is present → status = `draft`. This decision happens in PostsService, not the controller, keeping the controller thin. The Gateway is responsible for calling media-service first and passing back the `mediaId` — content-service just trusts whatever it receives.

**RabbitMQ consumer uses manual ack**
`channel.ack(msg)` is called only after the DB update succeeds. If the update throws, the message is nacked and requeued. This prevents silent data loss where a `media.processed` event is consumed but the post status never updates.

**Dockerfile: multi-stage build**
Stage 1 (builder): install all deps, compile TypeScript to `dist/`.
Stage 2 (runner): copy only `dist/` and `node_modules/`, run as non-root. Keeps the final image lean.

## Risks / Trade-offs

[TypeORM synchronize:true drops and recreates columns on entity change] → Acceptable in local dev. Never use in production. Documented in README.

[amqplib connection is not automatically reconnected on broker restart] → For local dev this is fine — restart the container. A production service would use a reconnect library or the NestJS microservices transport layer.

[No request validation on POST /posts body] → Add class-validator DTOs with ValidationPipe to reject malformed requests early.
