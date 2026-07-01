## Why

User engagement events (new post, new comment, new like, media processed) are already being published to RabbitMQ by other services, but nothing is consuming `notification-service-queue` to act on them. notification-service closes that loop by consuming those events and logging a structured notification — establishing the pattern for future delivery channels (email, push, websocket).

## What Changes

- Add `apps/notification-service/` as a self-contained NestJS app with its own `package.json` and `Dockerfile`
- Consume `notification-service-queue` from RabbitMQ exchange `pulsepost_events`; the queue already binds to routing keys: `post.created`, `comment.created`, `like.added`, `media.processed`
- For each event type, log a structured notification: who did what, on which post
- No database needed — notifications are logged only (no persistence in this phase)
- No outbound delivery (no email, no push, no websocket) in this phase

## Capabilities

### New Capabilities

- `notification-consumer`: Subscribe to `notification-service-queue`, consume and ack all 4 event types, log structured notification per event
- `notification-service-scaffold`: Self-contained NestJS app with own package.json, Dockerfile, amqplib — no TypeORM or Redis needed

### Modified Capabilities

## Impact

- New directory: `apps/notification-service/`
- New files: `package.json`, `Dockerfile`, `tsconfig.json`, RabbitMQ consumer service
- Connects to RabbitMQ `notification-service-queue` (already declared in `rabbitmq/definitions.json`)
- No database, no Redis — amqplib only
- Service runs on `PORT=3004` (HTTP server still started so NestJS lifecycle works, but no HTTP routes)
- No changes to existing services
