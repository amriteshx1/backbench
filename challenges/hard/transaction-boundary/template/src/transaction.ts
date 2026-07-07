let accounts = [{ id: "a1", balance: 100 }];

export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  // TODO: snapshot accounts, rollback on error, commit on success
  return fn();
}

import { Router } from "express";
export const router = Router();
router.post("/transfer", async (_req, res) => {
  await runInTransaction(async () => { accounts[0].balance -= 50; });
  return res.status(200).json({ accounts });
});
