## ADDED Requirements

### Requirement: Self-contained NestJS app with own package.json and Dockerfile
The system SHALL add `apps/media-service/` as an isolated NestJS application with its own `package.json`, `tsconfig.json`, and multi-stage `Dockerfile` — no shared code with other services.

#### Scenario: App builds independently
- **WHEN** `docker build -t media-service ./apps/media-service` is run from the repo root
- **THEN** the build SHALL succeed, producing a runnable image with no missing dependencies

### Requirement: Connects to media_db via TypeORM
The system SHALL configure TypeORM to connect to `media_db` using `DATABASE_URL` env var, with `synchronize: true` for local dev and the `Media` entity auto-created on startup.

#### Scenario: Service starts and creates media table
- **WHEN** the media-service container starts with a valid `DATABASE_URL` pointing to `media_db`
- **THEN** TypeORM SHALL create the `media` table automatically and log a successful database connection

### Requirement: Service listens on PORT env var defaulting to 3003
The system SHALL start the NestJS HTTP server on `process.env.PORT || 3003`.

#### Scenario: Default port binding
- **WHEN** no PORT env var is set
- **THEN** the service SHALL bind to port 3003
