## ADDED Requirements

### Requirement: POST /posts creates and persists a post
The system SHALL accept a POST /posts request with title, body, optional mediaId, and x-user-id header, persist the post to content_db, and return the created post.

#### Scenario: Post without image is created as published
- **WHEN** POST /posts is called with title and body and no mediaId
- **THEN** a post is saved with status `published` and the response includes id, authorId, title, body, status, createdAt

#### Scenario: Post with image is created as draft
- **WHEN** POST /posts is called with title, body, and a mediaId
- **THEN** a post is saved with status `draft` and mediaId set

#### Scenario: authorId is taken from x-user-id header
- **WHEN** POST /posts is called with header x-user-id: user-2
- **THEN** the created post has authorId set to "user-2"

### Requirement: post.created event is published to RabbitMQ after post creation
The system SHALL publish a `post.created` event to the `pulsepost_events` exchange after every successful post creation.

#### Scenario: post.created appears in notification-service-queue
- **WHEN** POST /posts succeeds
- **THEN** a message with routing key `post.created` appears in `notification-service-queue` containing postId, authorId, title, and status
