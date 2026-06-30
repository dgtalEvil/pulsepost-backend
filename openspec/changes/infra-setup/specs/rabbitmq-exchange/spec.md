## ADDED Requirements

### Requirement: Topic exchange exists on startup
The system SHALL have a topic exchange named `pulsepost_events` pre-declared in RabbitMQ before any service connects.

#### Scenario: Exchange is present after container starts
- **WHEN** RabbitMQ container reaches healthy state
- **THEN** the exchange `pulsepost_events` of type `topic` exists in the default vhost

### Requirement: Per-service queues and bindings are pre-declared
The system SHALL have one durable queue per consuming service, each bound to `pulsepost_events` with the correct routing keys.

#### Scenario: content-service queue exists with correct binding
- **WHEN** RabbitMQ container reaches healthy state
- **THEN** queue `content-service-queue` exists and is bound to `pulsepost_events` with routing key `media.processed`

#### Scenario: notification-service queue exists with correct bindings
- **WHEN** RabbitMQ container reaches healthy state
- **THEN** queue `notification-service-queue` exists and is bound to `pulsepost_events` with routing keys `post.created`, `comment.created`, `like.added`, and `media.processed`
