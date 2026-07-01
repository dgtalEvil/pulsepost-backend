## ADDED Requirements

### Requirement: Proxy POST /media to media-service
The gateway SHALL accept `POST /media` and forward to `MEDIA_SERVICE_URL/media`, returning the pending media record.

#### Scenario: Media registration proxied
- **WHEN** `POST /media` is called with `{ postId }`
- **THEN** gateway SHALL forward to media-service and return the 201 pending media record verbatim

### Requirement: Downstream errors are returned with correct status codes
The gateway SHALL catch axios errors from downstream services and re-throw with the original HTTP status code and error body, so the caller receives the same error as if they called the downstream service directly.

#### Scenario: Downstream returns 4xx error
- **WHEN** a downstream service returns HTTP 400, 401, 409, or 429
- **THEN** the gateway SHALL return the same status code and error body to the caller

#### Scenario: Downstream service unavailable
- **WHEN** a downstream service is unreachable (connection refused)
- **THEN** the gateway SHALL return HTTP 502 Bad Gateway with an error message
