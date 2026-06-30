## 1. Scaffold

- [x] 1.1 Create `apps/engagement-service/` directory structure: `src/comments/dto/`, `src/likes/dto/`, `src/rabbitmq/`, `src/redis/`
- [x] 1.2 Write `apps/engagement-service/package.json` with dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/typeorm`, `typeorm`, `pg`, `amqplib`, `ioredis`, `class-validator`, `class-transformer`, `reflect-metadata`, `rxjs` and devDependencies: `typescript`, `@types/node`, `@types/amqplib`, `@nestjs/cli`, `ts-node`
- [x] 1.3 Write `apps/engagement-service/tsconfig.json` with standard NestJS TypeScript config (same as content-service)
- [x] 1.4 Write `apps/engagement-service/src/main.ts` bootstrapping NestJS on `process.env.PORT || 3002`

## 2. Entities and DTOs

- [x] 2.1 Write `src/comments/comment.entity.ts`: id (uuid, primary), postId (varchar), authorId (varchar), body (text), createdAt (timestamp, default now)
- [x] 2.2 Write `src/likes/like.entity.ts`: id (uuid, primary), postId (varchar), authorId (varchar), createdAt (timestamp, default now) — unique constraint on (postId, authorId)
- [x] 2.3 Write `src/comments/dto/create-comment.dto.ts`: postId (string, required), body (string, required), authorId (string, required)
- [x] 2.4 Write `src/likes/dto/create-like.dto.ts`: postId (string, required), authorId (string, required)

## 3. Redis Service

- [x] 3.1 Write `src/redis/redis.service.ts` using ioredis: connects to `REDIS_URL` in constructor, exposes the Redis client as a property, logs connection success

## 4. RabbitMQ

- [x] 4.1 Write `src/rabbitmq/rabbitmq.service.ts` using same pattern as content-service: connects in `onModuleInit`, asserts `pulsepost_events` exchange, exposes channel getter
- [x] 4.2 Write `src/rabbitmq/rabbitmq.publisher.ts` with methods `publishCommentCreated(comment)` and `publishLikeAdded(like)` publishing to `pulsepost_events` with routing keys `comment.created` and `like.added`
- [x] 4.3 Write `src/rabbitmq/rabbitmq.module.ts` providing and exporting RabbitmqService and RabbitmqPublisher

## 5. Comments Module

- [x] 5.1 Write `src/comments/comments.service.ts` with `create(dto)` method: check Redis rate limit key `ratelimit:comment:{postId}:{authorId}` using `SET NX EX 5` — return 429 if key existed; save comment; call publisher; call Redis ZINCRBY on `trending:posts`
- [x] 5.2 Write `src/comments/comments.controller.ts` with `POST /comments` reading `x-user-id` header
- [x] 5.3 Write `src/comments/comments.module.ts` importing TypeOrmModule for Comment, RabbitmqModule, RedisModule

## 6. Likes Module

- [x] 6.1 Write `src/likes/likes.service.ts` with `create(dto)` method: save like; catch unique constraint violation (pg error code 23505) and throw 409; call publisher; call Redis ZINCRBY on `trending:posts`
- [x] 6.2 Write `src/likes/likes.controller.ts` with `POST /likes` reading `x-user-id` header
- [x] 6.3 Write `src/likes/likes.module.ts` importing TypeOrmModule for Like, RabbitmqModule, RedisModule

## 7. Trending Module

- [x] 7.1 Write `src/trending/trending.service.ts` with `getTopN(n = 10)` method: call Redis `ZREVRANGE trending:posts 0 9 WITHSCORES` and return `[{ postId, score }]`
- [x] 7.2 Write `src/trending/trending.controller.ts` with `GET /trending`
- [x] 7.3 Write `src/trending/trending.module.ts` importing RedisModule

## 8. Redis Module and App Module

- [x] 8.1 Write `src/redis/redis.module.ts` providing and exporting RedisService
- [x] 8.2 Write `src/app.module.ts` importing TypeOrmModule (connecting to DATABASE_URL for both entities), CommentsModule, LikesModule, TrendingModule

## 9. Dockerfile

- [x] 9.1 Write `apps/engagement-service/Dockerfile` — multi-stage build identical in structure to content-service Dockerfile

## 10. Verification

- [x] 10.1 Run `docker build -t engagement-service ./apps/engagement-service` and confirm build succeeds
- [x] 10.2 Run engagement-service container on Docker network, confirm it starts and logs connections to Postgres, Redis, RabbitMQ
- [x] 10.3 Call `POST /comments` with curl (x-user-id: user-1, postId, body) and confirm 201 response
- [x] 10.4 Call `POST /comments` again immediately (same postId + user) and confirm 429
- [x] 10.5 Call `POST /likes` and confirm 201 response
- [x] 10.6 Call `POST /likes` again (same postId + user) and confirm 409
- [x] 10.7 Run `redis-cli ZRANGE trending:posts 0 -1 WITHSCORES` and confirm postId appears with score > 0
- [x] 10.8 Call `GET /trending` and confirm postId appears in response
- [x] 10.9 Check RabbitMQ UI — confirm `comment.created` and `like.added` messages in `notification-service-queue`
