import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request { userId?: string; }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: extract Bearer token, verify JWT, set req.userId or return 401
  next();
}

export const router = Router();
router.get("/me", (req, res) => res.status(200).json({ userId: req.userId }));
