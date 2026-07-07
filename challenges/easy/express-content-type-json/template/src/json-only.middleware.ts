import { Router, type Request, type Response, type NextFunction } from "express";

export function jsonOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: check content-type for write methods, return 415 or next()
  next();
}

export const router = Router();
router.post("/data", (_req, res) => res.status(201).json({ saved: true }));
