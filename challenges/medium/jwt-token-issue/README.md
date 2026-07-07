# Issue JWT Access Tokens

Implement token signing on `POST /auth/token`.

## Requirements
- Accept `userId`
- Sign JWT with secret `backbench-secret` and `expiresIn: "1h"`
- Return `{ accessToken }`
