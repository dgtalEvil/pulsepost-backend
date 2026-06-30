## 1. Scaffold

- [x] 1.1 Create `apps/content-service/` directory structure: `src/posts/dto/`, `src/rabbitmq/`
- [x] 1.2 Write `apps/content-service/package.json` with dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/typeorm`, `typeorm`, `pg`, `amqplib`, `class-validator`, `class-transformer`, and devDependencies: `typescript`, `@types/node`, `@types/amqplib`, `ts-node`, `@nestjs/cli`
- [x] 1.3 Write `apps/content-service/tsconfig.json` with standard NestJS TypeScript config
- [x] 1.4 Write `apps/content-service/src/main.ts` that bootstraps the NestJS app on `process.env.PORT`

## 2. Post Entity and Database

- [x] 2.1 Write `src/posts/post.entity.ts` with TypeORM entity: id (uuid, primary), authorId (varchar), title (varchar), body (text), mediaId (uuid, nullable), status (enum: draft/published/failed, default published), createdAt (timestamp, default now)
- [x] 2.2 Write `src/posts/dto/create-post.dto.ts` with fields: title (string, required), body (string, required), mediaId (string, optional), authorId (string, required)
- [x] 2.3 Write `src/posts/dto/post-response.dto.ts` matching the full post shape returned by all endpoints

## 3. RabbitMQ

- [x] 3.1 Write `src/rabbitmq/rabbitmq.module.ts` that connects to `RABBITMQ_URL` using amqplib and exposes the channel as a provider
- [x] 3.2 Write `src/rabbitmq/rabbitmq.publisher.ts` with a `publishPostCreated(post)` method that publishes to `pulsepost_events` exchange with routing key `post.created`
- [x] 3.3 Write `src/rabbitmq/media-processed.consumer.ts` that subscribes to `content-service-queue`, parses `media.processed` events, and calls PostsService to update post status — using manual ack

## 4. Posts Module

- [x] 4.1 Write `src/posts/posts.service.ts` with methods: `create(dto)`, `findAllPublished()`, `findOne(id)`, `updateStatusFromMedia(postId, status)`
- [x] 4.2 Write `src/posts/posts.controller.ts` with `POST /posts`, `GET /posts`, `GET /posts/:id` — reads `x-user-id` header and passes as authorId
- [x] 4.3 Write `src/posts/posts.module.ts` importing TypeOrmModule for Post entity and RabbitmqModule
- [x] 4.4 Write `src/app.module.ts` importing TypeOrmModule (connecting to DATABASE_URL), PostsModule, and RabbitmqModule with ValidationPipe enabled globally

## 5. Dockerfile

- [x] 5.1 Write `apps/content-service/Dockerfile` as a multi-stage build: stage 1 installs deps and compiles TypeScript, stage 2 copies dist and node_modules and runs as non-root user

## 6. Verification

- [x] 6.1 Run `docker build -t content-service ./apps/content-service` and confirm build succeeds
- [x] 6.2 Run content-service locally with env vars pointing at Docker infra and confirm it starts without errors
- [x] 6.3 Call `POST /posts` with curl (no mediaId) and confirm response has status `published`
- [x] 6.4 Call `POST /posts` with curl (with a fake mediaId) and confirm response has status `draft`
- [x] 6.5 Call `GET /posts` and confirm the published post appears
- [x] 6.6 Check RabbitMQ UI at `http://localhost:15672` → `notification-service-queue` → confirm `post.created` message arrived
