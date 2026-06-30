## ADDED Requirements

### Requirement: Postgres is reachable on the default port
The system SHALL have a PostgreSQL instance accessible at port 5432 within the Docker network and on localhost during development.

#### Scenario: Postgres accepts a connection
- **WHEN** `psql -h localhost -U postgres` is run
- **THEN** a connection is established successfully

### Requirement: Per-service databases exist on first boot
The system SHALL have isolated databases for each service created automatically when the Postgres container starts for the first time.

#### Scenario: content_db exists
- **WHEN** Postgres container reaches healthy state
- **THEN** database `content_db` exists and is accessible to the `postgres` user

#### Scenario: engagement_db exists
- **WHEN** Postgres container reaches healthy state
- **THEN** database `engagement_db` exists and is accessible to the `postgres` user

#### Scenario: media_db exists
- **WHEN** Postgres container reaches healthy state
- **THEN** database `media_db` exists and is accessible to the `postgres` user
