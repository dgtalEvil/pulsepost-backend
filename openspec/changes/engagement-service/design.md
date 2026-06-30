## Context

engagement-service is the second NestJS application in PulsePost. It owns `comments` and `likes` tables in `engagement_db` and is the only service that reads or writes those tables. It publishes two event types (`comment.created`, `like.added`) but consumes nothing from RabbitMQ. It uses Redis for two distinct purposes: rate limiting and trending score tracking.

Same tech stack pattern as content-service: NestJS, TypeORM, pg, amqplib, plus `ioredis` for Redis.

## Goals / Non-Goals

**Goals:**
- Same RabbitmqService pattern as content-service (OnModuleInit, channel getter) — no @Global factories
- Rate limit: Redis key `ratelimit:comment:{postId}:{authorId}` with 5s TTL using SETNX — reject with 429 if key exists
- Trending: Redis sorted set `trending:posts` — score formula: `timestamp_seconds + (engagement_count * 100)` where engagement_count is incremented via Redis ZINCRBY
- Duplicate like guard: PostgreSQL unique constraint on (postId, authorId) — catch the unique violation and return 409
- `GET /trending` returns top 10 postIds with scores as `[{ postId, score }]`

**Non-Goals:**
- Consuming RabbitMQ events (this service only publishes)
- Auth beyond reading x-user-id header
- Pagination on trending
- Fetching post details — Gateway handles aggregation if needed

## Decisions

**ioredis over node-redis**
ioredis has better TypeScript support, built-in reconnect logic, and a more intuitive API for sorted set commands (`zadd`, `zincrby`, `zrevrange`). node-redis v4 changed its API significantly and has more footguns. ioredis wins.

**Trending score formula: ZINCRBY instead of recalculating**
Rather than computing a score from scratch each time, use `ZINCRBY trending:posts 1 {postId}` on every like/comment. This is O(log N) and atomic. The sorted set naturally keeps posts ranked by cumulative engagement. For recency bias we add the post's creation timestamp (in seconds) as a base score on first insertion via `ZADD NX` — so newer posts start higher and engagement compounds on top.

**Rate limit with SETNX + EXPIRE (not sliding window)**
A fixed 5-second window per (postId, authorId) pair is sufficient. SETNX sets the key only if it doesn't exist; EXPIRE sets the TTL. If SETNX returns 0 (key existed) → 429. Simple, atomic, no Lua script needed.

**Unique constraint at DB level for likes, not Redis**
Redis SETNX could guard duplicates but the DB unique constraint is the true idempotency guarantee — it survives Redis restarts. Catch the TypeORM unique violation error (code 23505) and return 409. No need for a Redis guard on top.

**Same Dockerfile pattern as content-service**
Multi-stage: builder installs deps + compiles TS, runner copies dist + node_modules, runs as non-root.

## Risks / Trade-offs

[Redis sorted set score drift over time] → Acceptable for local dev. In production you'd add a time-decay factor or periodic score normalization job.

[SETNX + EXPIRE is two commands, not atomic] → Between the two calls, if the process crashes, the key exists without a TTL (never expires). Mitigation: use `SET key value NX EX 5` (single atomic command with NX and EX flags) — available in Redis 2.6.12+. Use this instead of separate SETNX + EXPIRE.

[TypeORM unique constraint error code] → PostgreSQL throws error code `23505` on unique violation. TypeORM wraps this in a QueryFailedError. Catch specifically on that code to return 409; re-throw anything else.
