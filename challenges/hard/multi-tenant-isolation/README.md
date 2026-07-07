# Multi-Tenant Data Isolation

Implement tenant middleware and scoped repository.

## Requirements
- `tenantMiddleware` reads `X-Tenant-Id`, sets `req.tenantId`
- `findDocuments(tenantId)` returns only matching tenant docs
- Return `400` if tenant header missing
