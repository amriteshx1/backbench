# Append-Only Event Store

Implement `EventStore`.

## Requirements
- `append(streamId, event)` adds to stream
- `load(streamId)` returns all events in order
- `projectBalance(events)` folds AccountCredited/AccountDebited
