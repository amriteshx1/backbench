# Cursor-Based Pagination

Implement `GET /feed`.

## Requirements
- Accept `cursor` and `limit` query params
- Return `{ items, nextCursor }`
- `nextCursor` is null when no more items
