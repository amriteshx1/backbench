type LockEntry = { token: string; expiresAt: number };
const locks = new Map<string, LockEntry>();

export class LockManager {
  acquire(key: string, ttlMs: number): string | null {
    // TODO: return token if acquired, null if held and not expired
    return null;
  }

  release(key: string, token: string): boolean {
    // TODO: release only if token matches
    return false;
  }
}

import { Router } from "express";
export const router = Router();
const locks_ = new LockManager();
router.post("/lock/:key", (req, res) => {
  const token = locks_.acquire(req.params.key, 5000);
  return res.status(token ? 200 : 409).json({ token });
});
