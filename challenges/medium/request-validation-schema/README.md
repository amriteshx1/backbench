# Schema-Based Request Validation

Implement `validateBody(schema)` middleware.

## Requirements
- Schema defines required string fields
- Return `400` with field errors array on failure
- Attach validated body to `req.validatedBody`
