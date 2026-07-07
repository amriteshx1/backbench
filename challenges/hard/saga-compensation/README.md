# Saga With Compensation

Implement `runOrderSaga(orderId)`.

## Requirements
- Steps: reserveInventory, chargePayment, sendConfirmation
- On failure, run compensation for completed steps in reverse
- Return success/failure result object
