import { Router, type Request, type Response, type NextFunction } from "express";

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: track IP, enforce 10 req/min, return 429 when exceeded
  next();
}

export const router = Router();
router.get("/api", (_req, res) => res.status(200).json({ ok: true }));
