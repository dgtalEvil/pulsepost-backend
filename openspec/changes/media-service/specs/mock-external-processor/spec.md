## ADDED Requirements

### Requirement: Mock processor fires after delay and calls own webhook
The system SHALL simulate an external CDN processor by scheduling a `setTimeout` callback after a 3-second delay. When the callback fires, it SHALL make an HTTP POST to `http://localhost:{PORT}/webhooks/media` with the correct `x-webhook-secret` header.

#### Scenario: Mock processor triggers webhook after delay
- **WHEN** `POST /media` completes and creates a pending record
- **THEN** a 3-second setTimeout SHALL be scheduled that POSTs to the service's own webhook endpoint with `{ mediaId, postId, status, url? }` payload and `x-webhook-secret` header set to `MEDIA_WEBHOOK_SECRET`

### Requirement: Mock processor randomly resolves success or failure
The system SHALL randomly determine processing outcome using `Math.random() > 0.5`. On success it SHALL include a fake CDN URL; on failure it SHALL set status to `failed`.

#### Scenario: Random success outcome
- **WHEN** the setTimeout callback fires and `Math.random() > 0.5` is true
- **THEN** the webhook POST body SHALL be `{ mediaId, postId, status: "ready", url: "https://cdn.mock/<mediaId>.jpg" }`

#### Scenario: Random failure outcome
- **WHEN** the setTimeout callback fires and `Math.random() > 0.5` is false
- **THEN** the webhook POST body SHALL be `{ mediaId, postId, status: "failed" }`
