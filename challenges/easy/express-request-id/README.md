# Attach Request ID Middleware

Implement `requestIdMiddleware`.

## Requirements
- Generate a UUID for each request
- Set response header `X-Request-Id`
- Attach `req.requestId` for downstream handlers
- Export middleware and a sample GET /ping route
