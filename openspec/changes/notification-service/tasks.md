## 1. Scaffold

- [x] 1.1 Create `apps/notification-service/` directory structure: `src/notification/`, `src/rabbitmq/`
- [x] 1.2 Write `apps/notification-service/package.json` with dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `amqplib`, `reflect-metadata`, `rxjs` and devDependencies: `typescript`, `@types/node`, `@types/amqplib`, `@nestjs/cli`, `ts-node`
- [x] 1.3 Write `apps/notification-service/tsconfig.json` with standard NestJS TypeScript config (same as other services)
- [x] 1.4 Write `apps/notification-service/src/main.ts` bootstrapping NestJS on `process.env.PORT || 3004`

## 2. RabbitMQ

- [x] 2.1 Write `src/rabbitmq/rabbitmq.service.ts` using same OnModuleInit pattern: connects to RABBITMQ_URL, asserts `pulsepost_events` topic exchange, exposes channel getter
- [x] 2.2 Write `src/rabbitmq/rabbitmq.module.ts` providing and exporting RabbitmqService

## 3. Notification Consumer

- [x] 3.1 Write `src/notification/notification.consumer.ts` implementing `OnModuleInit`:
  - Assert `notification-service-queue` (durable: true)
  - Bind queue to `pulsepost_events` for all 4 routing keys: `post.created`, `comment.created`, `like.added`, `media.processed`
  - Call `channel.consume` with `{ noAck: false }`
  - In the consumer callback: parse `msg.fields.routingKey`, dispatch to a private handler method per event type, always ack in a finally block
  - `handlePostCreated`: log `[Notification] New post by <authorId>: <title>`
  - `handleCommentCreated`: log `[Notification] New comment on post <postId> by <authorId>`
  - `handleLikeAdded`: log `[Notification] Post <postId> liked by <authorId>`
  - `handleMediaProcessed`: log `[Notification] Media <mediaId> processed: <status>`
- [x] 3.2 Write `src/notification/notification.module.ts` importing RabbitmqModule and providing NotificationConsumer

## 4. App Module

- [x] 4.1 Write `src/app.module.ts` importing NotificationModule (no TypeOrmModule needed)

## 5. Dockerfile

- [x] 5.1 Write `apps/notification-service/Dockerfile` — multi-stage build identical in structure to other service Dockerfiles

## 6. Verification

- [x] 6.1 Run `docker build -t notification-service ./apps/notification-service` and confirm build succeeds
- [x] 6.2 Run notification-service container on Docker network, confirm it starts and logs connection to RabbitMQ
- [x] 6.3 Call `POST /posts` on content-service and confirm notification-service logs `[Notification] New post by ...`
- [x] 6.4 Call `POST /comments` on engagement-service and confirm notification-service logs `[Notification] New comment on post ...`
- [x] 6.5 Call `POST /media` on media-service and wait 3s, confirm notification-service logs `[Notification] Media ... processed: ready/failed`
