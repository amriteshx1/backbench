type RetryOptions = { maxAttempts?: number; baseDelayMs?: number };

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  // TODO: retry with exponential backoff, throw on exhaustion
  return fn();
}

import { Router } from "express";
export const router = Router();
router.get("/flaky", async (_req, res) => {
  const result = await retryWithBackoff(async () => "ok", { maxAttempts: 3 });
  return res.status(200).json({ result });
});
