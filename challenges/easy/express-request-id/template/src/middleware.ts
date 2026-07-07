import { Router, type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request { requestId?: string; }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: generate id, set header X-Request-Id, attach to req, call next()
  next();
}

export const router = Router();
router.get("/ping", (req, res) => {
  return res.status(200).json({ requestId: req.requestId ?? "missing" });
});
