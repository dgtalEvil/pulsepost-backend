## Context

The gateway is the fifth and final NestJS app in PulsePost's backend. It is a thin HTTP proxy — it receives requests from clients (and eventually the frontend), attaches `x-user-id` from the incoming header to outbound calls, and forwards to the appropriate downstream service. No business logic lives here. All four downstream services are already running and have been verified independently.

Same scaffolding pattern: NestJS, own package.json and Dockerfile. No TypeORM, no amqplib, no ioredis.

## Goals / Non-Goals

**Goals:**
- Single entry point on PORT=3000 for all PulsePost API calls
- Forward `x-user-id` header from incoming request to all downstream calls
- Proxy 7 routes across 3 downstream services (content, engagement, media)
- Downstream URLs configurable via env vars (no hardcoded ports)
- Return downstream responses (status code + body) verbatim to the caller
- Multi-stage Dockerfile, non-root user, same pattern as other services

**Non-Goals:**
- Real auth (JWT, OAuth) — x-user-id header passthrough only
- Request transformation or aggregation (no BFF patterns)
- Rate limiting, circuit breaking, retries — keep it simple
- Proxying to notification-service (it has no HTTP routes)
- Load balancing across multiple instances of downstream services

## Decisions

**axios for HTTP forwarding**
`axios` is the standard Node HTTP client for NestJS apps. It handles status code preservation and response body forwarding cleanly. An `HttpService` wrapper (`@nestjs/axios`) would add RxJS overhead for no benefit here — use plain `axios` instead (direct import).

**ProxyService: single service, method per downstream call**
Rather than per-service proxy services (ContentProxyService, EngagementProxyService), one `ProxyService` with typed methods (`forwardToContent(method, path, body, headers)`, etc.) keeps the code flat. Each controller method calls the appropriate `ProxyService` method.

**Downstream URLs via env vars**
- `CONTENT_SERVICE_URL` (default: `http://localhost:3001`)
- `ENGAGEMENT_SERVICE_URL` (default: `http://localhost:3002`)
- `MEDIA_SERVICE_URL` (default: `http://localhost:3003`)

Inside Docker, these will be set to service names on the shared network (e.g., `http://content-service:3001`).

**Return downstream status + body verbatim**
The gateway catches axios errors and re-throws the downstream status code using NestJS `HttpException`. This means a 404 from content-service becomes a 404 to the client — transparent proxying.

**x-user-id passthrough**
Each controller reads `x-user-id` from the incoming header and passes it along in the `axios` call headers. Downstream services already expect this header directly.

**Three controllers: PostsController, EngagementController, MediaController**
Split by downstream service to keep routing clear. Each controller is thin — validate presence of `x-user-id` where needed, forward, return result.

## Risks / Trade-offs

[No connection pooling or timeout config on axios] → For prototype/dev use this is fine. Add `axios.defaults.timeout` if needed.

[Gateway becomes a single point of failure] → Acceptable for dev. In prod, add health checks and restart policies.

[Downstream errors with non-JSON bodies could break JSON parsing] → Mitigated by catching axios errors and extracting `error.response?.data` with a fallback string message.
