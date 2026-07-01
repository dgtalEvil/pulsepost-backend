## 1. Scaffold

- [x] 1.1 Create `apps/gateway/` directory structure: `src/posts/`, `src/engagement/`, `src/media/`, `src/proxy/`
- [x] 1.2 Write `apps/gateway/package.json` with dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `axios`, `reflect-metadata`, `rxjs` and devDependencies: `typescript`, `@types/node`, `@nestjs/cli`, `ts-node`
- [x] 1.3 Write `apps/gateway/tsconfig.json` with standard NestJS TypeScript config (same as other services)
- [x] 1.4 Write `apps/gateway/src/main.ts` bootstrapping NestJS on `process.env.PORT || 3000`

## 2. Proxy Service

- [x] 2.1 Write `src/proxy/proxy.service.ts` with:
  - Constructor reads `CONTENT_SERVICE_URL`, `ENGAGEMENT_SERVICE_URL`, `MEDIA_SERVICE_URL` from env (with localhost defaults)
  - `forward(method, url, body?, headers?)`: makes the axios call, returns `{ status, data }`, catches AxiosError and re-throws as NestJS `HttpException` with downstream status + body; throws 502 on connection error
  - Helper methods: `toContent(method, path, body?, headers?)`, `toEngagement(method, path, body?, headers?)`, `toMedia(method, path, body?, headers?)`
- [x] 2.2 Write `src/proxy/proxy.module.ts` providing and exporting ProxyService

## 3. Posts Controller

- [x] 3.1 Write `src/posts/posts.controller.ts` with:
  - `POST /posts` — reads `x-user-id` header, forwards body + header to content-service via `proxyService.toContent`
  - `GET /posts` — forwards to content-service, returns array
  - `GET /posts/:id` — forwards to content-service with path param
- [x] 3.2 Write `src/posts/posts.module.ts` importing ProxyModule

## 4. Engagement Controller

- [x] 4.1 Write `src/engagement/engagement.controller.ts` with:
  - `POST /comments` — reads `x-user-id`, forwards body + header to engagement-service
  - `POST /likes` — reads `x-user-id`, forwards body + header to engagement-service
  - `GET /trending` — forwards to engagement-service
- [x] 4.2 Write `src/engagement/engagement.module.ts` importing ProxyModule

## 5. Media Controller

- [x] 5.1 Write `src/media/media.controller.ts` with:
  - `POST /media` — forwards body to media-service
- [x] 5.2 Write `src/media/media.module.ts` importing ProxyModule

## 6. App Module

- [x] 6.1 Write `src/app.module.ts` importing PostsModule, EngagementModule, MediaModule

## 7. Dockerfile

- [x] 7.1 Write `apps/gateway/Dockerfile` — multi-stage build identical in structure to other service Dockerfiles

## 8. Verification

- [x] 8.1 Run `docker build -t gateway ./apps/gateway` and confirm build succeeds
- [x] 8.2 Run gateway container on Docker network with downstream URL env vars pointing to service names, confirm it starts on port 3000
- [x] 8.3 `POST /posts` via gateway (port 3000) — confirm 201 post created
- [x] 8.4 `GET /posts` via gateway — confirm array returned
- [x] 8.5 `POST /comments` via gateway — confirm 201 comment created
- [x] 8.6 `POST /likes` via gateway — confirm 201; repeat and confirm 409
- [x] 8.7 `GET /trending` via gateway — confirm trending posts array
- [x] 8.8 `POST /media` via gateway — confirm 201 pending record; wait 3s and confirm notification-service logs media.processed
