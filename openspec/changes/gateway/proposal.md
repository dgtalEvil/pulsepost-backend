## Why

The four backend services (content, engagement, media, notification) are currently called directly by port from the outside. A gateway gives clients a single origin, adds the mock auth header (`x-user-id`) extraction point, and hides internal service URLs — the standard API gateway pattern before adding a real frontend.

## What Changes

- Add `apps/gateway/` as a self-contained NestJS app with its own `package.json` and `Dockerfile`
- Expose a unified HTTP API on `PORT=3000` that proxies requests to the downstream services
- Extract `x-user-id` from incoming requests and forward it to downstream calls
- Use `axios` (or Node's built-in `fetch`) to forward requests — no service mesh, no NestJS microservices transport
- Routes:
  - `POST /posts` → content-service `POST /posts`
  - `GET /posts` → content-service `GET /posts`
  - `GET /posts/:id` → content-service `GET /posts/:id`
  - `POST /comments` → engagement-service `POST /comments`
  - `POST /likes` → engagement-service `POST /likes`
  - `GET /trending` → engagement-service `GET /trending`
  - `POST /media` → media-service `POST /media`
- No database, no RabbitMQ, no Redis — HTTP proxy only

## Capabilities

### New Capabilities

- `gateway-posts`: Proxy POST/GET /posts and GET /posts/:id to content-service
- `gateway-engagement`: Proxy POST /comments, POST /likes, GET /trending to engagement-service
- `gateway-media`: Proxy POST /media to media-service
- `gateway-scaffold`: Self-contained NestJS app with own package.json, Dockerfile, axios — no TypeORM, RabbitMQ, or Redis

### Modified Capabilities

## Impact

- New directory: `apps/gateway/`
- New files: `package.json`, `Dockerfile`, `tsconfig.json`, controllers, proxy service, app module
- Service runs on `PORT=3000` — the single external entry point
- Downstream URLs configured via env vars: `CONTENT_SERVICE_URL`, `ENGAGEMENT_SERVICE_URL`, `MEDIA_SERVICE_URL`
- No changes to existing services
