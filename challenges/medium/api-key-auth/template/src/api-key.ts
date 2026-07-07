import { Router, type Request, type Response, type NextFunction } from "express";
const allowedKeys = new Set(["key_live_abc", "key_test_xyz"]);

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: validate X-API-Key header against allowedKeys
  next();
}

export const router = Router();
router.get("/protected", apiKeyMiddleware, (_req, res) => res.status(200).json({ data: "secret" }));
