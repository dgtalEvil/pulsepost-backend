## Context

media-service is the third NestJS app in PulsePost. It owns the `media` table in `media_db` and simulates an async image processing pipeline. The key design challenge is the mock external processor: in production, an external CDN would call your webhook; here we simulate it with a setTimeout inside the same process that makes an HTTP POST to its own webhook endpoint after a delay.

Same tech stack pattern: NestJS, TypeORM, pg, amqplib. No Redis needed.

## Goals / Non-Goals

**Goals:**
- `POST /media` returns immediately with a pending media record — it does not wait for processing
- Mock external processor fires after 3 seconds and calls `POST /webhooks/media` on itself
- Webhook validates `x-webhook-secret` header — rejects with 401 if missing or wrong
- On valid webhook: update media record to ready/failed, publish `media.processed` to RabbitMQ
- Same RabbitmqService pattern as content-service and engagement-service
- Test the webhook directly with curl before wiring up the delayed mock path (build order requirement)

**Non-Goals:**
- Real file upload/storage (no multipart, no S3, no disk I/O)
- Retry logic on failed processing
- Auth on `POST /media` beyond what Gateway provides
- Redis (not needed by this service)

## Decisions

**Self-calling setTimeout for mock processor**
The mock external processor is a private method on MediaService that schedules a `setTimeout` callback. After the delay, it uses Node's built-in `fetch` (Node 18+) or `axios` (if needed) to POST to its own webhook endpoint at `http://localhost:{PORT}/webhooks/media`. This simulates an external CDN calling back without needing a separate process.

Alternatively it could call the webhook handler method directly (in-process) — but calling the HTTP endpoint is better because it exercises the full webhook validation path (header check, parsing) exactly as the real external processor would.

**50/50 success/failure simulation**
The mock processor randomly decides success or failure (`Math.random() > 0.5`). On success it sends `status: "ready"` with a fake CDN URL. On failure it sends `status: "failed"`. This makes the draft→published and draft→failed flows both testable without configuration.

**Webhook secret via env var `MEDIA_WEBHOOK_SECRET`**
Simple header comparison: if `x-webhook-secret` header !== `process.env.MEDIA_WEBHOOK_SECRET`, return 401. No HMAC needed for a mock implementation.

**postId on media record**
`POST /media` receives `{ postId }` from the Gateway so the media record is linked to a post from creation. The `media.processed` event includes `postId` so content-service can find and update the right post.

**Two controllers: MediaController and WebhookController**
Separating internal (`/media`) and public (`/webhooks/media`) endpoints into two controllers keeps the routing clear and makes it obvious which endpoint is "public" vs "internal".

## Risks / Trade-offs

[Self-calling HTTP request requires the service to be fully started] → The setTimeout fires after 3s which is well after NestJS finishes bootstrapping (~200ms). No risk in practice.

[Mock URL for self-call uses localhost] → Inside Docker, the service calls itself via `localhost:{PORT}` which works since the container's own loopback is accessible. No cross-container networking needed.

[Math.random() means non-deterministic test results] → For manual curl testing this is fine. Force determinism by using a fixed seed or temporarily hardcoding success for verification.
