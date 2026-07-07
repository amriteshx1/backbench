# Retry With Exponential Backoff

Implement `retryWithBackoff(fn, options)`.

## Requirements
- Retry up to `maxAttempts` (default 3)
- Delay = baseDelayMs * 2^attempt
- Throw last error when exhausted
