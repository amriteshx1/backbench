# Soft Delete Pattern

Implement soft delete for users.

## Requirements
- `DELETE /users/:id` sets `deletedAt` timestamp
- `GET /users` excludes soft-deleted records
- Return `404` if user not found
