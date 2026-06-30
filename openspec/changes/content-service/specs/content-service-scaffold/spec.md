## ADDED Requirements

### Requirement: content-service is a self-contained NestJS app
The system SHALL have a standalone NestJS application under `apps/content-service/` with its own package.json and node_modules, importing nothing from other apps in this repo.

#### Scenario: App starts and connects to Postgres and RabbitMQ
- **WHEN** the container starts with valid DATABASE_URL and RABBITMQ_URL env vars
- **THEN** the app logs successful connection to both and begins listening on PORT

#### Scenario: App has its own Dockerfile
- **WHEN** `docker build` is run from `apps/content-service/`
- **THEN** the image builds successfully with a multi-stage build producing a lean runtime image

### Requirement: content-service reads required env vars on startup
The system SHALL require DATABASE_URL, RABBITMQ_URL, and PORT env vars and fail fast if any are missing.

#### Scenario: Missing DATABASE_URL causes startup failure
- **WHEN** the app starts without DATABASE_URL set
- **THEN** the process exits with a non-zero code and a clear error message
