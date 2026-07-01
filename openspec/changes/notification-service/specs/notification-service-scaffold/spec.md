## ADDED Requirements

### Requirement: Self-contained NestJS app with own package.json and Dockerfile
The system SHALL add `apps/notification-service/` as an isolated NestJS application with its own `package.json`, `tsconfig.json`, and multi-stage `Dockerfile` — no shared code with other services. Only amqplib is needed; no TypeORM or ioredis.

#### Scenario: App builds independently
- **WHEN** `docker build -t notification-service ./apps/notification-service` is run from the repo root
- **THEN** the build SHALL succeed, producing a runnable image with no missing dependencies

### Requirement: Service listens on PORT env var defaulting to 3004
The system SHALL start the NestJS HTTP server on `process.env.PORT || 3004`. No HTTP routes are registered.

#### Scenario: Default port binding
- **WHEN** no PORT env var is set
- **THEN** the service SHALL bind to port 3004 and log `notification-service running on port 3004`
