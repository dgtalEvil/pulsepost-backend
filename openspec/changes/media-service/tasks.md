## 1. Scaffold

- [x] 1.1 Create `apps/media-service/` directory structure: `src/media/dto/`, `src/rabbitmq/`
- [x] 1.2 Write `apps/media-service/package.json` with dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/typeorm`, `typeorm`, `pg`, `amqplib`, `class-validator`, `class-transformer`, `reflect-metadata`, `rxjs` and devDependencies: `typescript`, `@types/node`, `@types/amqplib`, `@nestjs/cli`, `ts-node`
- [x] 1.3 Write `apps/media-service/tsconfig.json` with standard NestJS TypeScript config (same as content-service)
- [x] 1.4 Write `apps/media-service/src/main.ts` bootstrapping NestJS on `process.env.PORT || 3003`

## 2. Entity and DTOs

- [x] 2.1 Write `src/media/media.entity.ts`: id (uuid, primary generated), postId (varchar, nullable), status (enum: pending/processing/ready/failed, default pending), url (varchar, nullable), createdAt (timestamp, default now)
- [x] 2.2 Write `src/media/dto/create-media.dto.ts`: postId (string, required)
- [x] 2.3 Write `src/media/dto/webhook-media.dto.ts`: mediaId (string, required), postId (string, required), status (string, required), url (string, optional)

## 3. RabbitMQ

- [x] 3.1 Write `src/rabbitmq/rabbitmq.service.ts` using same OnModuleInit pattern as content-service: connects to RABBITMQ_URL, asserts `pulsepost_events` topic exchange, exposes channel getter
- [x] 3.2 Write `src/rabbitmq/rabbitmq.publisher.ts` with method `publishMediaProcessed({ mediaId, postId, status })` publishing to `pulsepost_events` with routing key `media.processed`
- [x] 3.3 Write `src/rabbitmq/rabbitmq.module.ts` providing and exporting RabbitmqService and RabbitmqPublisher

## 4. Media Module

- [x] 4.1 Write `src/media/media.service.ts` with:
  - `create(dto)`: saves pending record, calls `triggerMockProcessor(media)` (no await), returns saved record
  - `processWebhook(dto)`: finds record by id, updates status and url, calls publisher
  - `triggerMockProcessor(media)`: private method — schedules setTimeout 3000ms, then fetches own webhook with `x-webhook-secret` header and random success/failure payload
- [x] 4.2 Write `src/media/media.controller.ts` with `POST /media` — reads body, calls `mediaService.create(dto)`, returns 201
- [x] 4.3 Write `src/media/webhook.controller.ts` with `POST /webhooks/media` — validates `x-webhook-secret` header (throws 401 if missing/wrong), calls `mediaService.processWebhook(dto)`, returns 200
- [x] 4.4 Write `src/media/media.module.ts` importing TypeOrmModule.forFeature([Media]) and RabbitmqModule, providing MediaService, providing/registering both controllers

## 5. App Module

- [x] 5.1 Write `src/app.module.ts` importing TypeOrmModule.forRoot (DATABASE_URL, synchronize: true, entities: [Media]) and MediaModule

## 6. Dockerfile

- [x] 6.1 Write `apps/media-service/Dockerfile` — multi-stage build identical in structure to content-service Dockerfile

## 7. Verification

- [x] 7.1 Run `docker build -t media-service ./apps/media-service` and confirm build succeeds
- [x] 7.2 Run media-service container on Docker network, confirm it starts and logs connections to Postgres and RabbitMQ
- [x] 7.3 Call `POST /media` with curl (`{ postId: "<uuid>" }`) and confirm 201 with pending record
- [x] 7.4 Wait 3 seconds and check RabbitMQ UI — confirm `media.processed` message in `notification-service-queue` and `content-service-queue`
- [x] 7.5 Call `POST /webhooks/media` directly with wrong secret and confirm 401
- [x] 7.6 Call `POST /webhooks/media` directly with correct secret and a valid payload and confirm 200
