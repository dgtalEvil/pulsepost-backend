## ADDED Requirements

### Requirement: Proxy POST /comments to engagement-service
The gateway SHALL accept `POST /comments` with `x-user-id` header and forward to `ENGAGEMENT_SERVICE_URL/comments`, returning the downstream response verbatim.

#### Scenario: Comment creation proxied
- **WHEN** `POST /comments` is called with `x-user-id` and `{ postId, body }`
- **THEN** gateway SHALL forward to engagement-service with the same headers and body, returning the 201 comment object or 429 rate-limit error verbatim

### Requirement: Proxy POST /likes to engagement-service
The gateway SHALL accept `POST /likes` with `x-user-id` header and forward to `ENGAGEMENT_SERVICE_URL/likes`.

#### Scenario: Like creation proxied
- **WHEN** `POST /likes` is called with `x-user-id` and `{ postId }`
- **THEN** gateway SHALL forward to engagement-service, returning 201 or 409 conflict verbatim

### Requirement: Proxy GET /trending to engagement-service
The gateway SHALL accept `GET /trending` and forward to `ENGAGEMENT_SERVICE_URL/trending`, returning the trending posts array.

#### Scenario: Trending posts proxied
- **WHEN** `GET /trending` is called on the gateway
- **THEN** gateway SHALL forward to engagement-service and return the `[{ postId, score }]` array verbatim
