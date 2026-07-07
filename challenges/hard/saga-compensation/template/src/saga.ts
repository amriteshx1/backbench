type StepResult = { ok: boolean };

const completed: string[] = [];

export async function runOrderSaga(orderId: string): Promise<{ success: boolean }> {
  // TODO: run steps in order, compensate in reverse on failure
  return { success: false };
}

import { Router } from "express";
export const router = Router();
router.post("/orders/:id/saga", async (req, res) => {
  const result = await runOrderSaga(req.params.id);
  return res.status(result.success ? 200 : 500).json(result);
});
