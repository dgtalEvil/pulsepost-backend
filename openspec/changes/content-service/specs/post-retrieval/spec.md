## ADDED Requirements

### Requirement: GET /posts returns all published posts
The system SHALL return a list of all posts with status `published`, ordered by createdAt descending.

#### Scenario: Published posts are returned
- **WHEN** GET /posts is called
- **THEN** the response is an array of posts each with id, authorId, title, body, mediaId, status, createdAt

#### Scenario: Draft and failed posts are excluded
- **WHEN** GET /posts is called and some posts have status draft or failed
- **THEN** only published posts appear in the response

### Requirement: GET /posts/:id returns a single post by id
The system SHALL return a single post by its UUID regardless of status.

#### Scenario: Existing post is returned
- **WHEN** GET /posts/:id is called with a valid post id
- **THEN** the response contains the full post object

#### Scenario: Non-existent post returns 404
- **WHEN** GET /posts/:id is called with an id that does not exist
- **THEN** the response status is 404
