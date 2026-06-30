## Why

With infrastructure running, we need the first NestJS service that owns post data. content-service is the entry point for all post creation and retrieval in PulsePost — without it, no other service has anything to react to. It is built first among the services because every downstream event (`comment.created`, `like.added`, `media.processed`) references a `postId` that content-service creates.

## What Changes

- Add `apps/content-service/` as a self-contained NestJS app with its own `package.json` and `Dockerfile`
- Add a `posts` table in `content_db` with columns: `id`, `authorId`, `title`, `body`, `mediaId` (nullable), `status` (draft/published/failed), `createdAt`
- Expose three internal HTTP endpoints: `POST /posts`, `GET /posts`, `GET /posts/:id`
- Publish `post.created` event to RabbitMQ topic exchange `pulsepost_events` after every post creation
- Consume `media.processed` event from `content-service-queue` and flip post status to `published` or `failed`

## Capabilities

### New Capabilities

- `post-creation`: Accept post data from Gateway, persist to DB with correct initial status (published if no image, draft if image pending), publish `post.created` to RabbitMQ
- `post-retrieval`: Serve `GET /posts` (list published posts) and `GET /posts/:id` (single post) for Gateway to proxy
- `media-status-update`: Consume `media.processed` from RabbitMQ and update post status accordingly
- `content-service-scaffold`: Self-contained NestJS app structure with own package.json, Dockerfile, TypeORM + Postgres connection, RabbitMQ connection

### Modified Capabilities

## Impact

- New directory: `apps/content-service/`
- New files: `package.json`, `Dockerfile`, `src/main.ts`, `src/app.module.ts`, entity, service, controller, DTOs, RabbitMQ publisher and consumer
- Connects to `content_db` (already created by infra init.sql)
- Connects to RabbitMQ exchange `pulsepost_events` and queue `content-service-queue` (already declared by infra definitions.json)
- No changes to existing files
- Service will run on `PORT=3001` internally, added to `docker-compose.yml` in a later step
