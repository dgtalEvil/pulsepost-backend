## ADDED Requirements

### Requirement: media.processed event flips post status
The system SHALL consume `media.processed` events from `content-service-queue` and update the matching post's status based on the event outcome.

#### Scenario: Successful media processing publishes the post
- **WHEN** a `media.processed` event arrives with status `ready` and a postId
- **THEN** the post with that postId has its status updated to `published` and mediaId confirmed set

#### Scenario: Failed media processing marks the post as failed
- **WHEN** a `media.processed` event arrives with status `failed` and a postId
- **THEN** the post with that postId has its status updated to `failed`

### Requirement: media.processed consumer is idempotent
The system SHALL handle duplicate `media.processed` events without corrupting post state.

#### Scenario: Duplicate event does not change an already-published post to failed
- **WHEN** a `media.processed` event with status `ready` is processed twice for the same postId
- **THEN** the post status remains `published` after both events
