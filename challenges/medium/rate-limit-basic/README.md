# In-Memory Rate Limiter

Implement `rateLimitMiddleware`.

## Requirements
- Track request count per IP in a Map
- Allow max 10 requests per 60-second window
- Return `429` when exceeded
