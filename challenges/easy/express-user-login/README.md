# Build User Login Endpoint

Implement `POST /auth/login`.

## Requirements
- Accept JSON: `email`, `password`
- Return `400` if fields missing
- Return `401` for invalid credentials
- Return `200` with `{ token: "..." }` on success
- Use in-memory users array for lookup
