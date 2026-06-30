## ADDED Requirements

### Requirement: POST /likes creates and persists a like
The system SHALL accept a POST /likes request with postId and x-user-id header, persist the like, and return the created like.

#### Scenario: Valid like is created and returned
- **WHEN** POST /likes is called with postId and x-user-id: user-1
- **THEN** a like is saved with id, postId, authorId, createdAt and returned with status 201

### Requirement: Duplicate likes are rejected
The system SHALL reject a like if the same user has already liked the same post.

#### Scenario: Duplicate like returns 409
- **WHEN** POST /likes is called twice for the same (postId, authorId)
- **THEN** the second call returns status 409

### Requirement: like.added event is published after like creation
The system SHALL publish a `like.added` event to `pulsepost_events` exchange after every successful like creation.

#### Scenario: like.added appears in notification-service-queue
- **WHEN** POST /likes succeeds
- **THEN** a message with routing key `like.added` appears in `notification-service-queue` containing likeId, postId, authorId
