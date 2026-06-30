## ADDED Requirements

### Requirement: Single command brings up all infrastructure
The system SHALL start RabbitMQ, Redis, and Postgres together with `docker-compose up`.

#### Scenario: All three containers reach healthy state
- **WHEN** `docker-compose up -d` is run from the repo root
- **THEN** containers for `rabbitmq`, `redis`, and `postgres` all reach a running/healthy state within 60 seconds

### Requirement: Infrastructure ports are exposed on localhost
The system SHALL expose all service ports on the host machine for local development and verification.

#### Scenario: RabbitMQ ports are accessible
- **WHEN** all containers are running
- **THEN** RabbitMQ AMQP is accessible on `localhost:5672` and management UI on `localhost:15672`

#### Scenario: Redis port is accessible
- **WHEN** all containers are running
- **THEN** Redis is accessible on `localhost:6379`

#### Scenario: Postgres port is accessible
- **WHEN** all containers are running
- **THEN** Postgres is accessible on `localhost:5432`

### Requirement: Data persists across container restarts
The system SHALL use named Docker volumes so data survives `docker-compose restart` but is cleared by `docker-compose down -v`.

#### Scenario: Postgres data survives restart
- **WHEN** `docker-compose restart postgres` is run after inserting data
- **THEN** the previously inserted data is still present after the container restarts
