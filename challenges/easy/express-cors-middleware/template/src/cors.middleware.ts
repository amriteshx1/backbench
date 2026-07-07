import { Router, type Request, type Response, type NextFunction } from "express";

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: set CORS headers, handle OPTIONS with 204
  next();
}

export const router = Router();
router.get("/api/data", (_req, res) => res.status(200).json({ ok: true }));
