## ADDED Requirements

### Requirement: Redis sorted set is updated on every like and comment
The system SHALL increment the score of a postId in `trending:posts` sorted set by 1 on every successful like or comment creation.

#### Scenario: Score increases after a like
- **WHEN** POST /likes succeeds for postId X
- **THEN** `ZSCORE trending:posts X` returns a value higher than before the like

#### Scenario: Score increases after a comment
- **WHEN** POST /comments succeeds for postId X
- **THEN** `ZSCORE trending:posts X` returns a value higher than before the comment

### Requirement: GET /trending returns top 10 posts by score
The system SHALL return an ordered list of up to 10 postIds with their scores from the `trending:posts` sorted set, highest score first.

#### Scenario: Trending returns posts ordered by engagement
- **WHEN** GET /trending is called after multiple likes and comments on different posts
- **THEN** the response is an array of `{ postId, score }` objects ordered by score descending, max 10 items

#### Scenario: Trending returns empty array when no engagement exists
- **WHEN** GET /trending is called with an empty sorted set
- **THEN** the response is an empty array
