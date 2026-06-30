## ADDED Requirements

### Requirement: Redis is reachable on the default port
The system SHALL have a Redis instance accessible at port 6379 within the Docker network and on localhost during development.

#### Scenario: Redis responds to ping
- **WHEN** `redis-cli ping` is run against the container
- **THEN** the response is `PONG`

### Requirement: Redis supports pub/sub, sorted sets, and string keys
The system SHALL support all three usage patterns required by the backend services without additional configuration.

#### Scenario: Pub/sub channel accepts publish and subscribe
- **WHEN** a client subscribes to `post-activity:test` and another publishes to it
- **THEN** the subscriber receives the published message

#### Scenario: Sorted set operations work
- **WHEN** `ZADD trending:posts 100 post-1` is run
- **THEN** `ZRANGE trending:posts 0 -1 WITHSCORES` returns `post-1` with score `100`
