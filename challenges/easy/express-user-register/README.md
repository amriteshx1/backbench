# Build User Registration Endpoint

Implement an Express endpoint: `POST /users/register`.

## Requirements

- Accept JSON body with: `email`, `username`, `password`
- Return `400` if any field is missing
- Return `409` if email is already used
- Return `201` with created user JSON for success
- Store users in memory for now

## Response Shape

```json
{
  "id": "generated-id",
  "email": "user@example.com",
  "username": "new_user"
}
```

## Notes

- Do not return passwords in responses.
- Keep implementation inside the starter template files.
