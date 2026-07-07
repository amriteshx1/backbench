# Verify JWT Middleware

Implement `authMiddleware`.

## Requirements
- Read Authorization Bearer token
- Verify with secret `backbench-secret`
- Attach `req.userId` from payload
- Return `401` on invalid/missing token
