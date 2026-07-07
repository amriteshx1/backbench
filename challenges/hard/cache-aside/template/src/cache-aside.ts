type CacheEntry = { value: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();

export async function getCached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  // TODO: cache-aside read-through with TTL
  return loader();
}

import { Router } from "express";
export const router = Router();
router.get("/users/:id", async (req, res) => {
  const user = await getCached(`user:${req.params.id}`, async () => ({ id: req.params.id }), 60000);
  return res.status(200).json(user);
});
