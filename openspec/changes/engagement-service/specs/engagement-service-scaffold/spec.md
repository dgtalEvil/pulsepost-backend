## ADDED Requirements

### Requirement: engagement-service is a self-contained NestJS app
The system SHALL have a standalone NestJS application under `apps/engagement-service/` with its own package.json and node_modules, importing nothing from other apps in this repo.

#### Scenario: App starts and connects to Postgres, Redis, and RabbitMQ
- **WHEN** the container starts with valid DATABASE_URL, REDIS_URL, and RABBITMQ_URL env vars
- **THEN** the app logs successful connections to all three and begins listening on PORT

#### Scenario: App has its own Dockerfile
- **WHEN** `docker build` is run from `apps/engagement-service/`
- **THEN** the image builds successfully with a multi-stage build

### Requirement: engagement-service runs on PORT 3002
The system SHALL listen on the port defined by the PORT env var, defaulting to 3002.

#### Scenario: Service is reachable on port 3002
- **WHEN** the container starts with PORT=3002
- **THEN** HTTP requests to localhost:3002 are handled
