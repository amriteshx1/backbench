# Bulk Create Endpoint

Implement `POST /items/bulk`.

## Requirements
- Accept `{ items: Array<{ name: string }> }`
- Return `400` if any item missing name
- Return `201` with created count
