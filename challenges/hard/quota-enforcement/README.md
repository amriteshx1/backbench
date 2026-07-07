# API Quota Enforcement

Implement `quotaMiddleware(dailyLimit)`.

## Requirements
- Track request count per API key per day
- Reset counter when day changes
- Return `429` with `Retry-After` when quota exceeded
