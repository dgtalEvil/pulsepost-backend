## ADDED Requirements

### Requirement: Proxy POST /posts to content-service
The gateway SHALL accept `POST /posts` with `x-user-id` header and a JSON body, forward both to `CONTENT_SERVICE_URL/posts`, and return the downstream response verbatim.

#### Scenario: Successful post creation proxied
- **WHEN** `POST /posts` is called with `x-user-id` header and valid body `{ title, body }`
- **THEN** gateway SHALL forward to content-service with the same headers and body, and return the content-service response (HTTP 201 + post object) to the caller

#### Scenario: Missing x-user-id still forwarded
- **WHEN** `POST /posts` is called without `x-user-id` header
- **THEN** gateway SHALL still forward the request; content-service is responsible for handling the missing header

### Requirement: Proxy GET /posts to content-service
The gateway SHALL accept `GET /posts` and forward to `CONTENT_SERVICE_URL/posts`, returning the array of published posts.

#### Scenario: Get all posts proxied
- **WHEN** `GET /posts` is called on the gateway
- **THEN** gateway SHALL forward to content-service and return the array response with the same HTTP status

### Requirement: Proxy GET /posts/:id to content-service
The gateway SHALL accept `GET /posts/:id` and forward to `CONTENT_SERVICE_URL/posts/:id`.

#### Scenario: Get single post proxied
- **WHEN** `GET /posts/:id` is called on the gateway
- **THEN** gateway SHALL forward to content-service and return the post object or 404 verbatim
