# Audit Log Middleware

Implement `auditMiddleware`.

## Requirements
- Log POST/PUT/PATCH/DELETE to in-memory audit array
- Each entry: userId, method, path, timestamp
- Attach audit log via module export `getAuditLog()`
