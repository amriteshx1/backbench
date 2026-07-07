# Idempotent POST Handler

Implement idempotency for `POST /payments`.

## Requirements
- Read `Idempotency-Key` header
- Return cached response for duplicate keys
- Store response after first successful create
