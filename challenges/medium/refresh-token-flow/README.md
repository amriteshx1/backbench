# Refresh Token Rotation

Implement `POST /auth/refresh`.

## Requirements
- Accept `refreshToken` in body
- Validate against in-memory store
- Issue new accessToken + refreshToken
- Invalidate old refresh token (rotation)
