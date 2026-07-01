## ADDED Requirements

### Requirement: Accept media registration and return immediately
The system SHALL expose `POST /media` that accepts a `{ postId }` body, creates a media record with status `pending`, and returns the record immediately without waiting for processing to complete.

#### Scenario: Successful media registration
- **WHEN** a POST request is made to `/media` with a valid `postId` in the body
- **THEN** the system SHALL create a media record with status `pending`, return HTTP 201 with the created record (id, postId, status, createdAt), and trigger mock async processing in the background

#### Scenario: Missing postId
- **WHEN** a POST request is made to `/media` with no body or missing `postId`
- **THEN** the system SHALL return HTTP 400 with a validation error

### Requirement: Media entity persisted in media_db
The system SHALL persist media records to the `media` table in `media_db` via TypeORM.

#### Scenario: Media record created with pending status
- **WHEN** `POST /media` is called
- **THEN** a row SHALL be inserted into the `media` table with: id (uuid), postId (varchar), status (`pending`), url (null), createdAt (timestamp)
