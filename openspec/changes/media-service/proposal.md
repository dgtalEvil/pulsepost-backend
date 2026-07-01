## Why

When a post is created with an image, the Gateway calls media-service first to register the image and kick off processing. media-service simulates the real-world pattern of async external CDN processing — the image upload request returns immediately, processing happens in the background, and a webhook callback delivers the result later. Without media-service, posts with images can never transition from draft to published.

## What Changes

- Add `apps/media-service/` as a self-contained NestJS app with its own `package.json` and `Dockerfile`
- Add a `media` table in `media_db`: id, postId (nullable), status (pending/processing/ready/failed), url (nullable), createdAt
- Expose `POST /media` (internal, called by Gateway): create a pending media record, then simulate async external processing via a `setTimeout` delay that calls back the webhook endpoint
- Expose `POST /webhooks/media` (public-facing from external processor's POV): validate `x-webhook-secret` header, update media record, publish `media.processed` to RabbitMQ
- The mock external processor is implemented as a self-calling `setTimeout` within the same app — it POSTs to the webhook endpoint after a 3-second delay, simulating a real CDN callback

## Capabilities

### New Capabilities

- `media-upload`: Accept media registration from Gateway, persist pending record, trigger mock async processing
- `media-webhook`: Public webhook endpoint that validates secret, updates media status/url, publishes `media.processed`
- `mock-external-processor`: Internal setTimeout-based function that simulates an external CDN by calling the webhook after a delay
- `media-service-scaffold`: Self-contained NestJS app with own package.json, Dockerfile, TypeORM + Postgres, amqplib

### Modified Capabilities

## Impact

- New directory: `apps/media-service/`
- New files: `package.json`, `Dockerfile`, `tsconfig.json`, media entity, service, controllers, DTOs, RabbitMQ publisher
- Connects to `media_db` (already created by infra init.sql)
- Connects to RabbitMQ exchange `pulsepost_events` — publishes `media.processed`
- Requires `MEDIA_WEBHOOK_SECRET` env var for webhook validation
- Service runs on `PORT=3003`
- No changes to existing files
