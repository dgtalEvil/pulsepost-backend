## ADDED Requirements

### Requirement: Self-contained NestJS app with own package.json and Dockerfile
The system SHALL add `apps/gateway/` as an isolated NestJS application with its own `package.json`, `tsconfig.json`, and multi-stage `Dockerfile`. Dependencies: `axios` only (no TypeORM, amqplib, ioredis).

#### Scenario: App builds independently
- **WHEN** `docker build -t gateway ./apps/gateway` is run from the repo root
- **THEN** the build SHALL succeed, producing a runnable image with no missing dependencies

### Requirement: Service listens on PORT env var defaulting to 3000
The gateway SHALL start on `process.env.PORT || 3000` and log `gateway running on port 3000`.

#### Scenario: Default port binding
- **WHEN** no PORT env var is set
- **THEN** the service SHALL bind to port 3000

### Requirement: Downstream URLs configurable via env vars
The gateway SHALL read `CONTENT_SERVICE_URL`, `ENGAGEMENT_SERVICE_URL`, and `MEDIA_SERVICE_URL` env vars, with localhost defaults for local dev.

#### Scenario: Default URLs used when env vars absent
- **WHEN** no URL env vars are set
- **THEN** gateway SHALL use `http://localhost:3001`, `http://localhost:3002`, `http://localhost:3003` as defaults
