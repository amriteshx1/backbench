# Reject Non-JSON Content-Type

Implement `jsonOnlyMiddleware`.

## Requirements
- For POST/PUT/PATCH, require Content-Type application/json
- Return `415` otherwise
- Call next() when valid
