# Add Health Check Endpoint

Implement `GET /health`.

## Requirements
- Return `200` with `{ status: "ok", uptimeSeconds: number }`
- `uptimeSeconds` should reflect process uptime
