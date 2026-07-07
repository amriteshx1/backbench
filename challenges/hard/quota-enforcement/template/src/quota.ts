import { Router, type Request, type Response, type NextFunction } from "express";

type Usage = { count: number; day: string };
const usageByKey = new Map<string, Usage>();

export function quotaMiddleware(dailyLimit: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header("X-API-Key") ?? "anonymous";
    // TODO: track daily usage, return 429 with Retry-After when exceeded
    next();
  };
}

export const router = Router();
router.get("/api/data", quotaMiddleware(1000), (_req, res) => res.status(200).json({ ok: true }));
