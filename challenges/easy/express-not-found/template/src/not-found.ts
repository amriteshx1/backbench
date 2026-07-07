import { Router, type Request, type Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  // TODO: return 404 JSON with message Not found
  return res.status(500).json({ message: "error" });
}

export const router = Router();
router.get("/known", (_req, res) => res.status(200).json({ ok: true }));
