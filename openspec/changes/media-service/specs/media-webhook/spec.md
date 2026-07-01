## ADDED Requirements

### Requirement: Webhook validates secret header before processing
The system SHALL expose `POST /webhooks/media` and reject requests with a missing or incorrect `x-webhook-secret` header before doing any other processing.

#### Scenario: Valid webhook secret accepted
- **WHEN** a POST to `/webhooks/media` includes header `x-webhook-secret` matching `process.env.MEDIA_WEBHOOK_SECRET`
- **THEN** the system SHALL proceed to update the media record and return HTTP 200

#### Scenario: Missing or wrong secret rejected
- **WHEN** a POST to `/webhooks/media` is missing `x-webhook-secret` or the value does not match `MEDIA_WEBHOOK_SECRET`
- **THEN** the system SHALL return HTTP 401 and make no changes to any media record

### Requirement: Webhook updates media record and publishes event
The system SHALL update the media record status and URL (if ready), then publish a `media.processed` event to RabbitMQ exchange `pulsepost_events`.

#### Scenario: Processing succeeded
- **WHEN** webhook body contains `{ mediaId, postId, status: "ready", url: "<cdn-url>" }`
- **THEN** the system SHALL update the media record status to `ready`, set the url field to the provided CDN URL, and publish `media.processed` to `pulsepost_events` with payload `{ mediaId, postId, status: "ready" }`

#### Scenario: Processing failed
- **WHEN** webhook body contains `{ mediaId, postId, status: "failed" }`
- **THEN** the system SHALL update the media record status to `failed` and publish `media.processed` to `pulsepost_events` with payload `{ mediaId, postId, status: "failed" }`
