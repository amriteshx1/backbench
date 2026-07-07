# Cache-Aside Pattern

Implement `getCached(key, loader, ttlMs)`.

## Requirements
- Return cached value if present and not expired
- Call loader on miss, store result with TTL
- Return loaded value
