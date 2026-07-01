## Context

notification-service is the fourth NestJS app in PulsePost. It is a pure consumer — no HTTP routes with business logic, no database, no Redis. Its only job is to subscribe to `notification-service-queue` and log a human-readable notification for every event it receives. This queue is already declared by `rabbitmq/definitions.json` and bound to four routing keys: `post.created`, `comment.created`, `like.added`, `media.processed`.

Same tech stack pattern as the other services: NestJS, amqplib. No TypeORM or ioredis needed.

## Goals / Non-Goals

**Goals:**
- Subscribe to `notification-service-queue` via a single consumer on `OnModuleInit`
- Parse each message's routing key to determine event type
- Log a structured one-line notification per event (e.g., "New post by user-1: Hello PulsePost")
- Manual ack every message after processing (no dead-letter in this phase)
- Same RabbitmqService pattern as other services (OnModuleInit, no @Global)

**Non-Goals:**
- Outbound delivery (email, push notifications, websockets) — log only
- Notification persistence (no database)
- Fan-out per notification type (single consumer handles all 4 event types)
- Error retry / dead-letter queue
- HTTP endpoints with business logic (NestJS HTTP server starts but no routes registered)

## Decisions

**Single consumer class handles all 4 routing keys**
Rather than a separate consumer per event type, one `NotificationConsumer` class subscribes once to `notification-service-queue` and switches on `msg.fields.routingKey` to dispatch to private handler methods. This keeps the service minimal — there are no per-event-type business differences, just different log formats.

**Log-only output, no storage**
Notifications are logged with `Logger`. In a real system, this service would persist records or call an email/push API. The log-only approach means the service is pure infrastructure plumbing in this phase with zero risk of state divergence.

**No HTTP routes but NestJS HTTP server still starts**
NestJS lifecycle (`OnModuleInit`, `onModuleDestroy`) requires an application to be bootstrapped. We start the HTTP server on `PORT=3004` but register no routes. This keeps the startup pattern identical to other services so Docker healthchecks (if added later) have a surface to probe.

**amqplib manual ack**
All messages are ack'd after the log statement. No nack / requeue — if processing fails, the message is still ack'd to prevent queue buildup during this prototype phase.

**No TypeORM, no Redis**
notification-service has no data model and no rate-limiting. Removing these dependencies keeps the image small and the startup fast.

## Risks / Trade-offs

[Single consumer = no per-event resilience] → If one event type causes an unhandled error, it could block the consumer. Mitigated by wrapping each handler in try/catch and always acking.

[Log-only means notifications are lost if the consumer is down] → Acceptable for prototype; RabbitMQ will hold undelivered messages in the queue (durable) until the consumer reconnects.

[PORT=3004 HTTP server with no routes] → Any health probe to / will get a 404. Add a `GET /health` route if needed — but left out deliberately to keep scope minimal.
