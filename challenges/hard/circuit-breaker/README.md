# Circuit Breaker Pattern

Implement `CircuitBreaker` class.

## Requirements
- States: CLOSED, OPEN, HALF_OPEN
- Open after 3 consecutive failures
- Reject calls when OPEN
- Allow probe call in HALF_OPEN
