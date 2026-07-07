# Read/Write Query Routing

Implement `QueryRouter`.

## Requirements
- `execute(sql)` routes SELECT to replica
- INSERT/UPDATE/DELETE go to primary
- Track which target was used
