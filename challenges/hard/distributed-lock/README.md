# Redis-Style Distributed Lock

Implement `LockManager` with `acquire(key, ttlMs)` and `release(key, token)`.

## Requirements
- acquire returns unique token or null if locked
- release only succeeds with matching token
- Locks expire after TTL
