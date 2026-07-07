# Transactional Outbox

Implement `createUserWithOutbox(user)`.

## Requirements
- Save user to in-memory users array
- Append event `UserCreated` to outbox in same operation
- Both succeed or neither (simulate transaction)
