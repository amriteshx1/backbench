import { Router, type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request { user?: { role: string }; }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: check req.user.role, return 403 or next()
    next();
  };
}

export const router = Router();
router.get("/admin", requireRole("admin"), (_req, res) => res.status(200).json({ secret: true }));
