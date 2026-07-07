import { Router, type Request, type Response, type NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // TODO: log error, return 500 with err.message
  return res.status(200).json({ ok: true });
}

export const router = Router();
router.get("/boom", () => { throw new Error("Boom"); });
