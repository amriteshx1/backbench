# Simulated DB Transaction

Implement `runInTransaction(fn)`.

## Requirements
- Clone working state before fn
- Commit on success, rollback snapshot on thrown error
- Return fn result or rethrow
