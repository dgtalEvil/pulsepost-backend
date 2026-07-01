## ADDED Requirements

### Requirement: Subscribe to notification-service-queue on startup
The system SHALL connect to RabbitMQ and begin consuming `notification-service-queue` during `OnModuleInit`. All messages SHALL be manually acknowledged after processing.

#### Scenario: Consumer starts and binds to queue
- **WHEN** the notification-service starts
- **THEN** it SHALL connect to RabbitMQ, assert `pulsepost_events` exchange, assert `notification-service-queue` as durable, and call `channel.consume` with `{ noAck: false }`

### Requirement: Log structured notification for each event type
The system SHALL inspect `msg.fields.routingKey` and log a one-line human-readable notification for each of the four supported event types: `post.created`, `comment.created`, `like.added`, `media.processed`.

#### Scenario: post.created event received
- **WHEN** a message with routing key `post.created` arrives on `notification-service-queue`
- **THEN** the system SHALL log `[Notification] New post by <authorId>: <title>` and ack the message

#### Scenario: comment.created event received
- **WHEN** a message with routing key `comment.created` arrives
- **THEN** the system SHALL log `[Notification] New comment on post <postId> by <authorId>` and ack the message

#### Scenario: like.added event received
- **WHEN** a message with routing key `like.added` arrives
- **THEN** the system SHALL log `[Notification] Post <postId> liked by <authorId>` and ack the message

#### Scenario: media.processed event received
- **WHEN** a message with routing key `media.processed` arrives
- **THEN** the system SHALL log `[Notification] Media <mediaId> processed: <status>` and ack the message

### Requirement: Always ack messages, even on handler error
The system SHALL wrap each handler in try/catch and ack the message regardless of whether the handler threw an error, to prevent queue buildup.

#### Scenario: Handler throws an unexpected error
- **WHEN** parsing or logging throws an error
- **THEN** the system SHALL log the error and still call `channel.ack(msg)` so the message is not requeued
