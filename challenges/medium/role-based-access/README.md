# Role-Based Route Guard

Implement `requireRole(role)` factory.

## Requirements
- Check `req.user.role`
- Return `403` if role does not match
- Call next() when authorized
