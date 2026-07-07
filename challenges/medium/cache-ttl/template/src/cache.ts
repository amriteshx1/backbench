type Entry = { value: unknown; expiresAt: number };

export class Cache {
  private store = new Map<string, Entry>();

  get(key: string): unknown | null {
    // TODO: return value if not expired, else null
    return null;
  }

  set(key: string, value: unknown, ttlMs: number): void {
    // TODO: store value with expiresAt = Date.now() + ttlMs
  }
}

import { Router } from "express";
export const router = Router();
const cache = new Cache();
router.get("/cached", (_req, res) => res.status(200).json({ value: cache.get("x") }));
