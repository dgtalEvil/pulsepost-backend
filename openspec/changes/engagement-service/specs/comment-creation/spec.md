## ADDED Requirements

### Requirement: POST /comments creates and persists a comment
The system SHALL accept a POST /comments request with postId, body, and x-user-id header, persist the comment to engagement_db, and return the created comment.

#### Scenario: Valid comment is created and returned
- **WHEN** POST /comments is called with postId, body, and x-user-id: user-1
- **THEN** a comment is saved with id, postId, authorId (from header), body, createdAt and returned in the response

### Requirement: Comment creation is rate-limited per user per post
The system SHALL reject comment creation if the same user has commented on the same post within the last 5 seconds.

#### Scenario: First comment within window succeeds
- **WHEN** POST /comments is called for a (postId, authorId) pair for the first time
- **THEN** the comment is created and returned with status 201

#### Scenario: Second comment within 5 seconds is rejected
- **WHEN** POST /comments is called twice for the same (postId, authorId) within 5 seconds
- **THEN** the second call returns status 429

### Requirement: comment.created event is published after comment creation
The system SHALL publish a `comment.created` event to `pulsepost_events` exchange after every successful comment creation.

#### Scenario: comment.created appears in notification-service-queue
- **WHEN** POST /comments succeeds
- **THEN** a message with routing key `comment.created` appears in `notification-service-queue` containing commentId, postId, authorId, body
