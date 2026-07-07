# Optimistic Concurrency Control

Implement `PUT /records/:id`.

## Requirements
- Require `If-Match` header with version number
- Return `409` on version mismatch
- Increment version on successful update
